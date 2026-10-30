import { BackupError } from '@src/core/backup/backupErrors';
import { parseBackupJson, validateBackup } from '@src/core/backup/backupValidation';
import { createBackupFixture } from '../../../fixtures/backups';

describe('parseBackupJson', () => {
    it('accepts the complete current V1 backup after JSON serialization', () => {
        const fixture = createBackupFixture();
        expect(parseBackupJson(JSON.stringify(fixture))).toEqual(fixture);
    });

    it('rejects invalid JSON', () => {
        expect(() => parseBackupJson('{')).toThrow(new BackupError('INVALID_JSON'));
    });
});

describe('validateBackup', () => {
    it.each([null, [], {}, { kind: 'arc-timer/workout' }])(
        'rejects non-backup input: %p',
        (value) => {
            expect(() => validateBackup(value)).toThrow(BackupError);
        },
    );

    it.each([
        ['version', 2, 'UNSUPPORTED_FORMAT'],
        ['schemaVersion', 2, 'UNSUPPORTED_SCHEMA'],
        ['exportedAt', 'not-a-date', 'INVALID_DATA'],
    ])('rejects an invalid %s', (key, value, code) => {
        const action = () => validateBackup({ ...createBackupFixture(), [key]: value });
        expect(action).toThrow(BackupError);
        try {
            action();
        } catch (error: unknown) {
            expect(error).toMatchObject({ code });
        }
    });

    it('requires all managed tables', () => {
        expect(() => validateBackup({ ...createBackupFixture(), tables: {} })).toThrow(
            new BackupError('INVALID_DATA'),
        );
    });

    it.each([{}, { id: 'missing-fields' }, null, [], 'row'])(
        'rejects malformed workout rows: %p',
        (row) => {
            const fixture = createBackupFixture();
            expect(() =>
                validateBackup({
                    ...fixture,
                    tables: { ...fixture.tables, workouts: [row] },
                }),
            ).toThrow(new BackupError('INVALID_DATA'));
        },
    );

    it.each([
        { isFavorite: 'true' },
        { sortIndex: 0.5 },
        { sortIndex: Number.MIN_SAFE_INTEGER - 1 },
        { createdAtMs: NaN },
        { createdAtMs: Infinity },
        { createdAtMs: Number.MAX_SAFE_INTEGER + 1 },
        { id: '' },
        { currentVersionId: null },
        { extraField: 'unexpected' },
    ])('rejects malformed workout field values: %p', (patch) => {
        const fixture = createBackupFixture();
        expect(() =>
            validateBackup({
                ...fixture,
                tables: {
                    ...fixture.tables,
                    workouts: [{ ...fixture.tables.workouts[0], ...patch }],
                },
            }),
        ).toThrow(new BackupError('INVALID_DATA'));
    });

    it('rejects enum values that SQLite text columns do not constrain', () => {
        const fixture = createBackupFixture();
        expect(() =>
            validateBackup({
                ...fixture,
                tables: {
                    ...fixture.tables,
                    exerciseDefinitions: [
                        { ...fixture.tables.exerciseDefinitions[0], source: 'other' },
                    ],
                },
            }),
        ).toThrow(new BackupError('INVALID_DATA'));
    });

    it('accepts signed workout ordering while rejecting negative block positions', () => {
        const fixture = createBackupFixture();
        expect(validateBackup(fixture).tables.workouts[0].sortIndex).toBe(-1700000060000);
        fixture.tables.workoutBlocks[0].sortIndex = -1;
        expect(() => validateBackup(fixture)).toThrow(new BackupError('INVALID_DATA'));
    });

    it.each([
        { reps: 0 },
        { durationSec: 0 },
        { distanceMeters: 0 },
        { weightGrams: -1 },
        { rpeTenths: 101 },
    ])('rejects invalid gym set values in records and plan targets: %p', (patch) => {
        for (const table of ['gymExerciseRecordSets', 'gymPlanExerciseTargetSets'] as const) {
            const fixture = createBackupFixture();
            const tables = {
                ...fixture.tables,
                [table]: [{ ...fixture.tables[table][0], ...patch }],
            };
            expect(() => validateBackup({ ...fixture, tables })).toThrow(
                new BackupError('INVALID_DATA'),
            );
        }
    });

    it('accepts empty planned sets, unfinished sets, and zero-valued definition defaults', () => {
        const fixture = createBackupFixture();
        const emptyTracking = {
            reps: null,
            weightGrams: 0,
            durationSec: null,
            distanceMeters: null,
            rpeTenths: 0,
        };
        Object.assign(fixture.tables.gymPlanExerciseTargetSets[0], emptyTracking);
        Object.assign(fixture.tables.gymExerciseRecordSets[0], emptyTracking, {
            completedAtMs: null,
        });
        Object.assign(fixture.tables.exerciseDefinitionDefaultTrackingFields[0], {
            reps: 0,
            durationSec: 0,
            distanceMeters: 0,
        });
        expect(validateBackup(fixture)).toEqual(fixture);
    });

    it('rejects a completed set without a positive tracking value', () => {
        const fixture = createBackupFixture();
        Object.assign(fixture.tables.gymExerciseRecordSets[0], {
            reps: null,
            weightGrams: 0,
            durationSec: null,
            distanceMeters: null,
            rpeTenths: 0,
        });
        expect(() => validateBackup(fixture)).toThrow(new BackupError('INVALID_DATA'));
    });

    it.each([null, 1699999999999])(
        'rejects completed gym sessions with an invalid end time: %p',
        (endedAtMs) => {
            const fixture = createBackupFixture();
            fixture.tables.gymSessions[0].endedAtMs = endedAtMs;
            expect(() => validateBackup(fixture)).toThrow(new BackupError('INVALID_DATA'));
        },
    );

    it('requires active gym sessions to have no end time', () => {
        const fixture = createBackupFixture();
        fixture.tables.gymSessions[0].status = 'active';
        expect(() => validateBackup(fixture)).toThrow(new BackupError('INVALID_DATA'));
        fixture.tables.gymSessions[0].endedAtMs = null;
        expect(validateBackup(fixture)).toEqual(fixture);
    });

    it('rejects workout sessions that end before they start', () => {
        const fixture = createBackupFixture();
        fixture.tables.workoutSessions[0].endedAtMs =
            fixture.tables.workoutSessions[0].startedAtMs - 1;
        expect(() => validateBackup(fixture)).toThrow(new BackupError('INVALID_DATA'));
    });

    it('requires the current tracking flags', () => {
        const fixture = createBackupFixture();
        const { hasReps: _hasReps, ...row } =
            fixture.tables.exerciseDefinitionDefaultTrackingFields[0];
        expect(() =>
            validateBackup({
                ...fixture,
                tables: { ...fixture.tables, exerciseDefinitionDefaultTrackingFields: [row] },
            }),
        ).toThrow(new BackupError('INVALID_DATA'));
    });

    it.each(['{', '{}', '{"completedSets":"two"}'])(
        'rejects malformed embedded statistics: %s',
        (statsJson) => {
            const fixture = createBackupFixture();
            fixture.tables.workoutSessions[0].statsJson = statsJson;
            expect(() => validateBackup(fixture)).toThrow(new BackupError('INVALID_DATA'));
        },
    );

    it('does not include settings or language in the returned backup', () => {
        const result = validateBackup({
            ...createBackupFixture(),
            settings: { theme: 'dark' },
            language: 'pt-PT',
        });
        expect('settings' in result).toBe(false);
        expect('language' in result).toBe(false);
    });

    it('rejects a missing field in every supported row', () => {
        const fixture = createBackupFixture();
        for (const [table, rows] of Object.entries(fixture.tables)) {
            for (const row of rows) {
                for (const field of Object.keys(row)) {
                    const tables = {
                        ...fixture.tables,
                        [table]: [{ ...row, [field]: undefined }],
                    };
                    expect(() => validateBackup({ ...fixture, tables })).toThrow(BackupError);
                }
            }
        }
    });

    it.each([
        { completedSets: -1 },
        { completedExercises: 0.5 },
        { totalWorkSec: -10 },
        { workSecByBlock: [-1] },
    ])('rejects invalid embedded statistic values: %p', (patch) => {
        const fixture = createBackupFixture();
        fixture.tables.workoutSessions[0].statsJson = JSON.stringify({
            completedSets: 1,
            completedExercises: 1,
            totalWorkSec: 20,
            totalRestSec: 5,
            ...patch,
        });
        expect(() => validateBackup(fixture)).toThrow(new BackupError('INVALID_DATA'));
    });
});
