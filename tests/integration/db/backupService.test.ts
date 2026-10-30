import { eq, getTableColumns, getTableName } from 'drizzle-orm';
import { getTableConfig, SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';

import { BackupError } from '@src/core/backup/backupErrors';
import { CURRENT_BACKUP_SCHEMA_VERSION } from '@src/core/backup/backupTypes';
import { backupTables } from '@src/db/repositories/backups/backupRepositoryFactory';
import * as schema from '@src/db/schema';
import { createBackupFixture } from '../../fixtures/backups';
import { createWorkoutFixture } from '../../fixtures/workouts';
import { createTestDb, type TestDb } from '../../helpers/createTestDb';
import { seedBackupTables } from '../../helpers/seedBackupTables';
import { seedPersistedWorkout } from '../../helpers/seedWorkout';

const now = Date.UTC(2026, 9, 30, 12);
const dialect = new SQLiteSyncDialect();

describe('backup schema V1 compatibility', () => {
    it('includes every application table', () => {
        expect(Object.values(backupTables).map(getTableName).sort()).toEqual(
            Object.values(schema).map(getTableName).sort(),
        );
    });

    it('requires a compatibility decision when the data schema changes', () => {
        expect(CURRENT_BACKUP_SCHEMA_VERSION).toBe(1);
        const contract = Object.entries(backupTables).map(([key, table]) => {
            const config = getTableConfig(table);
            return {
                key,
                table: config.name,
                columns: Object.entries(getTableColumns(table)).map(([property, column]) => ({
                    property,
                    name: column.name,
                    sqlType: column.getSQLType(),
                    dataType: column.dataType,
                    enumValues: column.enumValues,
                    notNull: column.notNull,
                    primary: column.primary,
                    isUnique: column.isUnique,
                    hasDefault: column.hasDefault,
                    default: column.default ?? null,
                })),
                primaryKeys: config.primaryKeys.map((primaryKey) =>
                    primaryKey.columns.map((column) => column.name),
                ),
                foreignKeys: config.foreignKeys.map((foreignKey) => {
                    const reference = foreignKey.reference();
                    return {
                        columns: reference.columns.map((column) => column.name),
                        target: getTableName(reference.foreignTable),
                        targetColumns: reference.foreignColumns.map((column) => column.name),
                        onDelete: foreignKey.onDelete,
                        onUpdate: foreignKey.onUpdate,
                    };
                }),
                uniqueIndexes: config.indexes
                    .filter((index) => index.config.unique)
                    .map(({ config: indexConfig }) => ({
                        name: indexConfig.name,
                        columns: indexConfig.columns.map((column) => {
                            if ('name' in column) return column.name;
                            return dialect.sqlToQuery(column).sql;
                        }),
                        where: indexConfig.where ? dialect.sqlToQuery(indexConfig.where).sql : null,
                    })),
                uniqueConstraints: config.uniqueConstraints.map((constraint) =>
                    constraint.columns.map((column) => column.name),
                ),
                checks: config.checks.map((check) => dialect.sqlToQuery(check.value).sql),
            };
        });
        expect(contract).toMatchSnapshot('schema-version-1');
    });
});

describe('backupService.exportBackup', () => {
    let testDb: TestDb;
    beforeEach(() => {
        testDb = createTestDb({ now: () => now });
    });
    afterEach(() => {
        testDb.close();
    });

    it('exports all persisted data and system definitions with known metadata', () => {
        const fixture = createBackupFixture();
        seedBackupTables(testDb, fixture.tables);

        const result = testDb.dbServices.backupService.exportBackup();

        expect(result.exportedAt).toBe('2026-10-30T12:00:00.000Z');
        expect(result.version).toBe(1);
        expect(result.schemaVersion).toBe(1);
        for (const key of Object.keys(fixture.tables) as (keyof typeof fixture.tables)[]) {
            expect(result.tables[key]).toEqual(
                expect.arrayContaining<unknown>(fixture.tables[key]),
            );
        }
        expect(result.tables.exerciseDefinitions.some((row) => row.source === 'system')).toBe(true);
        expect(Object.keys(result).sort()).toEqual([
            'exportedAt',
            'kind',
            'schemaVersion',
            'tables',
            'version',
        ]);
    });

    it('round trips workouts with the negative ordering used by saved workouts', () => {
        const workout = createWorkoutFixture({ updatedAtMs: now });
        seedPersistedWorkout(testDb, workout);

        const exported = testDb.dbServices.backupService.exportBackup();

        expect(exported.tables.workouts[0].sortIndex).toBe(-now);
        const target = createTestDb();
        try {
            target.dbServices.backupService.restoreBackup(JSON.parse(JSON.stringify(exported)));
            expect(target.db.select().from(schema.workoutsTable).get()).toMatchObject({
                id: workout.id,
                sortIndex: -now,
            });
        } finally {
            target.close();
        }
    });

    it('round trips a populated database including historical references', () => {
        const fixture = createBackupFixture();
        seedBackupTables(testDb, fixture.tables);
        const exported = testDb.dbServices.backupService.exportBackup();
        const target = createTestDb();
        try {
            target.dbServices.backupService.restoreBackup(JSON.parse(JSON.stringify(exported)));
            expect(target.db.select().from(schema.gymExerciseRecordsTable).all()).toEqual(
                fixture.tables.gymExerciseRecords,
            );
            expect(target.db.select().from(schema.exerciseDefinitionStatsTable).all()).toEqual(
                fixture.tables.exerciseDefinitionStats,
            );
            expect(target.sqliteDb.pragma('foreign_key_check')).toEqual([]);
        } finally {
            target.close();
        }
    });
});

describe('backupService.restoreBackup', () => {
    let testDb: TestDb;
    beforeEach(() => {
        testDb = createTestDb();
    });
    afterEach(() => {
        testDb.close();
    });

    it('replaces every table with the backup data rather than merging', () => {
        const fixture = createBackupFixture();

        testDb.dbServices.backupService.restoreBackup(fixture);

        for (const key of Object.keys(backupTables) as (keyof typeof backupTables)[]) {
            expect(testDb.db.select().from(backupTables[key]).all()).toEqual(fixture.tables[key]);
        }
        expect(testDb.sqliteDb.pragma('foreign_key_check')).toEqual([]);
    });

    it('restores thousands of set rows without exceeding the SQLite variable limit', () => {
        const fixture = createBackupFixture();
        const originalSet = fixture.tables.gymExerciseRecordSets[0];
        fixture.tables.gymExerciseRecordSets = Array.from({ length: 4000 }, (_, index) => ({
            ...originalSet,
            id: index === 0 ? 'backup-set' : `backup-set-${index}`,
            setIndex: index,
        }));

        testDb.dbServices.backupService.restoreBackup(fixture);

        expect(testDb.db.select().from(schema.gymExerciseRecordSetsTable).all()).toHaveLength(4000);
        expect(
            testDb.db.select().from(schema.exerciseDefinitionStatsTable).get()?.weightPrSetId,
        ).toBe('backup-set');
    });

    it('preserves draft targets even when the target plan is in a later batch', () => {
        const fixture = createBackupFixture();
        const target = fixture.tables.gymPlans[1];
        fixture.tables.gymPlans = [
            fixture.tables.gymPlans[0],
            ...Array.from({ length: 150 }, (_, index) => ({
                ...target,
                id: `filler-${index}`,
            })),
            target,
        ];

        testDb.dbServices.backupService.restoreBackup(fixture);

        expect(
            testDb.db
                .select()
                .from(schema.gymPlansTable)
                .where(eq(schema.gymPlansTable.id, 'backup-draft'))
                .get()?.draftTargetGymPlanId,
        ).toBe('backup-plan');
    });

    it('rolls back all earlier writes when a later foreign key insertion fails', () => {
        const before = testDb.dbServices.backupService.exportBackup().tables;
        const fixture = createBackupFixture();
        fixture.tables.gymExerciseRecordSets[0].gymExerciseRecordId = 'missing-record';

        expect(() => testDb.dbServices.backupService.restoreBackup(fixture)).toThrow(
            new BackupError('RESTORE_FAILED'),
        );

        expect(testDb.dbServices.backupService.exportBackup().tables).toEqual(before);
    });

    it('rejects duplicate identities without deleting existing data', () => {
        const before = testDb.dbServices.backupService.exportBackup().tables;
        const fixture = createBackupFixture();
        fixture.tables.workouts.push({ ...fixture.tables.workouts[0] });

        expect(() => testDb.dbServices.backupService.restoreBackup(fixture)).toThrow(
            new BackupError('RESTORE_FAILED'),
        );
        expect(testDb.dbServices.backupService.exportBackup().tables).toEqual(before);
    });

    it('protects the current active gym session from replacement', () => {
        const fixture = createBackupFixture();
        testDb.db
            .insert(schema.gymSessionsTable)
            .values({
                ...fixture.tables.gymSessions[0],
                id: 'current-active',
                status: 'active',
                endedAtMs: null,
                sourceGymPlanId: null,
            })
            .run();
        const before = testDb.dbServices.backupService.exportBackup().tables;

        expect(() => testDb.dbServices.backupService.restoreBackup(fixture)).toThrow(
            new BackupError('ACTIVE_SESSION'),
        );
        expect(testDb.dbServices.backupService.exportBackup().tables).toEqual(before);
    });

    it.each([{ version: 2 }, { schemaVersion: 2 }, { kind: 'arc-timer/workout' }, { tables: {} }])(
        'leaves data intact when the envelope is rejected: %p',
        (patch) => {
            const before = testDb.dbServices.backupService.exportBackup().tables;
            expect(() =>
                testDb.dbServices.backupService.restoreBackup({
                    ...createBackupFixture(),
                    ...patch,
                }),
            ).toThrow(BackupError);
            expect(testDb.dbServices.backupService.exportBackup().tables).toEqual(before);
        },
    );

    it('revalidates row values even when restore is called without the file picker', () => {
        const before = testDb.dbServices.backupService.exportBackup().tables;
        const fixture = createBackupFixture();
        const input = {
            ...fixture,
            tables: {
                ...fixture.tables,
                workouts: [{ ...fixture.tables.workouts[0], isFavorite: 'true' }],
            },
        };
        expect(() => testDb.dbServices.backupService.restoreBackup(input)).toThrow(
            new BackupError('INVALID_DATA'),
        );
        expect(testDb.dbServices.backupService.exportBackup().tables).toEqual(before);
    });

    it.each([
        { status: 'completed', endedAtMs: null },
        { status: 'completed', endedAtMs: 1699999999999 },
        { status: 'active', endedAtMs: 1700000060000 },
    ])('preserves existing rows when gym session lifecycle data is invalid: %p', (patch) => {
        seedBackupTables(testDb, createBackupFixture().tables);
        const before = testDb.dbServices.backupService.exportBackup().tables;
        const fixture = createBackupFixture();
        const input = {
            ...fixture,
            tables: {
                ...fixture.tables,
                gymSessions: [{ ...fixture.tables.gymSessions[0], ...patch }],
            },
        };

        expect(() => testDb.dbServices.backupService.restoreBackup(input)).toThrow(
            new BackupError('INVALID_DATA'),
        );
        expect(testDb.dbServices.backupService.exportBackup().tables).toEqual(before);
    });

    it.each(['gymExerciseRecordSets', 'gymPlanExerciseTargetSets'] as const)(
        'preserves existing rows when %s contains invalid repetition counts',
        (table) => {
            seedBackupTables(testDb, createBackupFixture().tables);
            const before = testDb.dbServices.backupService.exportBackup().tables;
            const fixture = createBackupFixture();
            fixture.tables[table][0].reps = 0;

            expect(() => testDb.dbServices.backupService.restoreBackup(fixture)).toThrow(
                new BackupError('INVALID_DATA'),
            );
            expect(testDb.dbServices.backupService.exportBackup().tables).toEqual(before);
        },
    );
});
