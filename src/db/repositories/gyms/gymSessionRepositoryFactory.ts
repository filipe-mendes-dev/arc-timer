import { desc, eq, inArray, ne } from 'drizzle-orm';

import type { GymSessionListItem } from '@src/core/entities/gymSession.interfaces';

import {
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymSessionsTable,
    gymPlansTable,
} from '../../schema';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';

export type GymSessionRow = typeof gymSessionsTable.$inferSelect;
type GymSessionInsert = typeof gymSessionsTable.$inferInsert;
type GymSessionExerciseRecordInsert =
    typeof gymExerciseRecordsTable.$inferInsert;
type GymSessionExerciseRecordSetInsert =
    typeof gymExerciseRecordSetsTable.$inferInsert;
export interface UpdateGymSessionInput
    extends
        Pick<GymSessionRow, 'id' | 'updatedAtMs'>,
        Partial<
            Pick<
                GymSessionRow,
                | 'endedAtMs'
                | 'notes'
                | 'sourceGymPlanId'
                | 'sourceGymPlanName'
                | 'status'
            >
        > {}

export interface InsertGymSessionAggregateInput {
    exerciseRecords: GymSessionExerciseRecordInsert[];
    exerciseRecordSets: GymSessionExerciseRecordSetInsert[];
    session: GymSessionInsert;
}

export interface GymSessionRepository {
    getActive: () => GymSessionRow | null;
    getById: (id: string) => GymSessionRow | null;
    getRecent: (limit: number) => GymSessionRow[];
    getRecentListItems: (limit: number) => GymSessionListItem[];
    hasActive: () => boolean;
    hasSession: (id: string) => boolean;
    insert: (input: GymSessionInsert) => void;
    insertWithExerciseRecords: (input: InsertGymSessionAggregateInput) => void;
    update: (input: UpdateGymSessionInput) => void;
    delete: (id: string) => void;
}

export interface CreateGymSessionRepositoryArgs {
    db: RepositoryDb;
}

const gymSessionStatuses: GymSessionRow['status'][] = ['active', 'completed'];

const assertNonEmptyId = (id: string, fieldName: string): void => {
    if (id.trim().length === 0) {
        throw new Error(`${fieldName} cannot be blank`);
    }
};

const assertFiniteTimestamp = (value: number, fieldName: string): void => {
    if (!Number.isFinite(value)) {
        throw new Error(`${fieldName} must be finite`);
    }
};

const assertOptionalFiniteTimestamp = (
    value: number | null | undefined,
    fieldName: string,
): void => {
    if (value !== undefined && value !== null) {
        assertFiniteTimestamp(value, fieldName);
    }
};

const assertNullableFiniteTimestamp = (
    value: number | null | undefined,
    fieldName: string,
): void => {
    if (value !== undefined && value !== null) {
        assertFiniteTimestamp(value, fieldName);
    }
};

const assertIntegerAtLeast = (
    value: number,
    minimum: number,
    fieldName: string,
): void => {
    if (!Number.isInteger(value) || value < minimum) {
        throw new Error(`${fieldName} must be an integer >= ${minimum}`);
    }
};

const assertOptionalIntegerAtLeast = (
    value: number | null | undefined,
    minimum: number,
    fieldName: string,
): void => {
    if (value !== undefined && value !== null) {
        assertIntegerAtLeast(value, minimum, fieldName);
    }
};

const assertOptionalIntegerBetween = (
    value: number | null | undefined,
    minimum: number,
    maximum: number,
    fieldName: string,
): void => {
    if (
        value !== undefined &&
        value !== null &&
        (!Number.isInteger(value) || value < minimum || value > maximum)
    ) {
        throw new Error(
            `${fieldName} must be an integer between ${minimum} and ${maximum}`,
        );
    }
};

const assertValidStatus = (status: GymSessionRow['status']): void => {
    if (!gymSessionStatuses.includes(status)) {
        throw new Error(`Invalid gym session status ${status}`);
    }
};

const normalizeLimit = (limit: number): number =>
    Number.isInteger(limit) && limit > 0 ? limit : 10;

const assertSessionInput = (input: GymSessionInsert): void => {
    assertNonEmptyId(input.id, 'Gym session ID');
    assertFiniteTimestamp(input.startedAtMs, 'startedAtMs');
    assertNullableFiniteTimestamp(input.endedAtMs, 'endedAtMs');
    assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
    assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
    assertValidStatus(input.status);
};

const assertExerciseRecordInput = (
    input: GymSessionExerciseRecordInsert,
): void => {
    assertNonEmptyId(input.id, 'Gym exercise record ID');
    assertNonEmptyId(input.gymSessionId, 'Gym session ID');
    assertNonEmptyId(input.exerciseDefinitionId, 'Exercise definition ID');
    assertOptionalFiniteTimestamp(input.startedAtMs, 'startedAtMs');
    assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
    assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
    assertIntegerAtLeast(input.sortIndex, 0, 'sortIndex');
};

const assertExerciseRecordSetInput = (
    input: GymSessionExerciseRecordSetInsert,
): void => {
    assertNonEmptyId(input.id, 'Gym exercise record set ID');
    assertNonEmptyId(input.gymExerciseRecordId, 'Gym exercise record ID');
    assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
    assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
    assertIntegerAtLeast(input.setIndex, 0, 'setIndex');
    assertOptionalIntegerAtLeast(input.reps, 1, 'reps');
    assertOptionalIntegerAtLeast(input.weightGrams, 0, 'weightGrams');
    assertOptionalIntegerAtLeast(input.durationSec, 1, 'durationSec');
    assertOptionalIntegerAtLeast(input.distanceMeters, 1, 'distanceMeters');
    assertOptionalIntegerBetween(input.rpeTenths, 0, 100, 'rpeTenths');
};

export const createGymSessionRepository = ({
    db,
}: CreateGymSessionRepositoryArgs): GymSessionRepository => {
    const getCountsBySessionIds = (
        sessionIds: string[],
    ): Map<string, { exerciseRecordCount: number; setCount: number }> => {
        const countsBySessionId = new Map(
            sessionIds.map((id) => [
                id,
                { exerciseRecordCount: 0, setCount: 0 },
            ]),
        );
        if (sessionIds.length === 0) return countsBySessionId;

        const recordRows = db
            .select({
                id: gymExerciseRecordsTable.id,
                gymSessionId: gymExerciseRecordsTable.gymSessionId,
            })
            .from(gymExerciseRecordsTable)
            .where(inArray(gymExerciseRecordsTable.gymSessionId, sessionIds))
            .all();

        recordRows.forEach((record) => {
            const counts = countsBySessionId.get(record.gymSessionId);
            if (!counts) return;

            counts.exerciseRecordCount += 1;
        });

        if (recordRows.length === 0) return countsBySessionId;

        const sessionIdByRecordId = new Map(
            recordRows.map((record) => [record.id, record.gymSessionId]),
        );
        const setRows = db
            .select({
                gymExerciseRecordId:
                    gymExerciseRecordSetsTable.gymExerciseRecordId,
            })
            .from(gymExerciseRecordSetsTable)
            .where(
                inArray(
                    gymExerciseRecordSetsTable.gymExerciseRecordId,
                    recordRows.map((record) => record.id),
                ),
            )
            .all();

        setRows.forEach((set) => {
            const sessionId = sessionIdByRecordId.get(set.gymExerciseRecordId);
            if (!sessionId) return;

            const counts = countsBySessionId.get(sessionId);
            if (!counts) return;

            counts.setCount += 1;
        });

        return countsBySessionId;
    };

    return {
        getActive: (): GymSessionRow | null => {
            const row = db
                .select()
                .from(gymSessionsTable)
                .where(eq(gymSessionsTable.status, 'active'))
                .get();

            return row ?? null;
        },

        getById: (id: string): GymSessionRow | null => {
            assertNonEmptyId(id, 'Gym session ID');

            const row = db
                .select()
                .from(gymSessionsTable)
                .where(eq(gymSessionsTable.id, id))
                .get();

            return row ?? null;
        },

        getRecent: (limit: number): GymSessionRow[] =>
            db
                .select()
                .from(gymSessionsTable)
                .where(ne(gymSessionsTable.status, 'active'))
                .orderBy(desc(gymSessionsTable.startedAtMs))
                .limit(normalizeLimit(limit))
                .all(),

        getRecentListItems: (limit: number): GymSessionListItem[] => {
            const rows = db
                .select({
                    id: gymSessionsTable.id,
                    startedAtMs: gymSessionsTable.startedAtMs,
                    endedAtMs: gymSessionsTable.endedAtMs,
                    status: gymSessionsTable.status,
                    sourceGymPlanId: gymSessionsTable.sourceGymPlanId,
                    sourceGymPlanName: gymSessionsTable.sourceGymPlanName,
                    gymPlanName: gymPlansTable.name,
                })
                .from(gymSessionsTable)
                .leftJoin(
                    gymPlansTable,
                    eq(gymSessionsTable.sourceGymPlanId, gymPlansTable.id),
                )
                .where(eq(gymSessionsTable.status, 'completed'))
                .orderBy(desc(gymSessionsTable.startedAtMs))
                .limit(normalizeLimit(limit))
                .all();
            const countsBySessionId = getCountsBySessionIds(
                rows.map((row) => row.id),
            );

            return rows.map((row) => {
                const counts = countsBySessionId.get(row.id) ?? {
                    exerciseRecordCount: 0,
                    setCount: 0,
                };

                return {
                    id: row.id,
                    startedAtMs: row.startedAtMs,
                    endedAtMs: row.endedAtMs ?? undefined,
                    status: row.status,
                    sourceGymPlanId: row.sourceGymPlanId ?? undefined,
                    sourceGymPlanName:
                        row.gymPlanName ?? row.sourceGymPlanName ?? undefined,
                    exerciseRecordCount: counts.exerciseRecordCount,
                    setCount: counts.setCount,
                };
            });
        },

        hasActive: (): boolean => {
            const session = db
                .select({ id: gymSessionsTable.id })
                .from(gymSessionsTable)
                .where(eq(gymSessionsTable.status, 'active'))
                .limit(1)
                .get();

            return session !== undefined;
        },

        hasSession: (id: string): boolean => {
            assertNonEmptyId(id, 'Gym session ID');

            const session = db
                .select({ id: gymSessionsTable.id })
                .from(gymSessionsTable)
                .where(eq(gymSessionsTable.id, id))
                .limit(1)
                .get();

            return session !== undefined;
        },

        insert: (input: GymSessionInsert): void => {
            assertSessionInput(input);

            db.insert(gymSessionsTable)
                .values({
                    createdAtMs: input.createdAtMs,
                    endedAtMs: input.endedAtMs ?? null,
                    id: input.id,
                    notes: input.notes ?? null,
                    sourceGymPlanId: input.sourceGymPlanId ?? null,
                    sourceGymPlanName: input.sourceGymPlanName ?? null,
                    startedAtMs: input.startedAtMs,
                    status: input.status,
                    updatedAtMs: input.updatedAtMs,
                })
                .run();
        },

        insertWithExerciseRecords: ({
            exerciseRecords,
            exerciseRecordSets,
            session,
        }: InsertGymSessionAggregateInput): void => {
            assertSessionInput(session);
            exerciseRecords.forEach(assertExerciseRecordInput);
            exerciseRecordSets.forEach(assertExerciseRecordSetInput);

            db.transaction((tx) => {
                tx.insert(gymSessionsTable)
                    .values({
                        createdAtMs: session.createdAtMs,
                        endedAtMs: session.endedAtMs ?? null,
                        id: session.id,
                        notes: session.notes ?? null,
                        sourceGymPlanId: session.sourceGymPlanId ?? null,
                        sourceGymPlanName: session.sourceGymPlanName ?? null,
                        startedAtMs: session.startedAtMs,
                        status: session.status,
                        updatedAtMs: session.updatedAtMs,
                    })
                    .run();

                if (exerciseRecords.length > 0) {
                    tx.insert(gymExerciseRecordsTable)
                        .values(exerciseRecords)
                        .run();
                }

                if (exerciseRecordSets.length > 0) {
                    tx.insert(gymExerciseRecordSetsTable)
                        .values(exerciseRecordSets)
                        .run();
                }
            });
        },

        update: (input: UpdateGymSessionInput): void => {
            assertNonEmptyId(input.id, 'Gym session ID');
            assertNullableFiniteTimestamp(input.endedAtMs, 'endedAtMs');
            assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
            if (input.status !== undefined) {
                assertValidStatus(input.status);
            }

            db.update(gymSessionsTable)
                .set({
                    endedAtMs: input.endedAtMs,
                    notes: input.notes,
                    sourceGymPlanId: input.sourceGymPlanId,
                    sourceGymPlanName: input.sourceGymPlanName ?? null,
                    status: input.status,
                    updatedAtMs: input.updatedAtMs,
                })
                .where(eq(gymSessionsTable.id, input.id))
                .run();
        },

        delete: (id: string): void => {
            assertNonEmptyId(id, 'Gym session ID');

            db.delete(gymSessionsTable)
                .where(eq(gymSessionsTable.id, id))
                .run();
        },
    };
};
