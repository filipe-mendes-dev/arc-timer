import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import type {
    ExerciseDefinitionSetMetric,
    ExerciseDefinitionStats,
} from '@src/core/entities/exerciseDefinition.interfaces';
import type { GymSessionListItem } from '@src/core/entities/gymSession.interfaces';

import {
    exerciseDefinitionRecentGymSessionsTable,
    exerciseDefinitionStatsTable,
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymPlansTable,
    gymSessionsTable,
} from '../../schema';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';

type ExerciseDefinitionStatsRow =
    typeof exerciseDefinitionStatsTable.$inferSelect;
type ExerciseDefinitionStatsInsert =
    typeof exerciseDefinitionStatsTable.$inferInsert;
type RecentGymSessionInsert =
    typeof exerciseDefinitionRecentGymSessionsTable.$inferInsert;

export interface RebuildExerciseDefinitionStatsInput {
    exerciseDefinitionIds: string[];
    updatedAtMs: number;
}

export interface ExerciseDefinitionStatsRepository {
    getByExerciseDefinitionId: (
        exerciseDefinitionId: string,
    ) => ExerciseDefinitionStats | null;
    rebuildForExerciseDefinitionIds: (
        input: RebuildExerciseDefinitionStatsInput,
    ) => void;
}

export interface CreateExerciseDefinitionStatsRepositoryArgs {
    db: RepositoryDb;
}

interface CompletedSessionReference {
    gymSessionId: string;
    startedAtMs: number;
}

interface CompletedSetMetricCandidate {
    completedAtMs?: number;
    gymExerciseRecordSetId: string;
    gymSessionId: string;
    reps?: number;
    value: number;
}

const RECENT_COMPLETED_SESSION_LIMIT = 5;

const metricFromStatsRow = (
    row: ExerciseDefinitionStatsRow,
    kind: 'distance' | 'weight',
): ExerciseDefinitionSetMetric | undefined => {
    const gymExerciseRecordSetId =
        kind === 'weight' ? row.weightPrSetId : row.distancePrSetId;
    const gymSessionId =
        kind === 'weight'
            ? row.weightPrGymSessionId
            : row.distancePrGymSessionId;
    const value =
        kind === 'weight' ? row.weightPrGrams : row.distancePrMeters;

    if (!gymExerciseRecordSetId || !gymSessionId || value === null) {
        return undefined;
    }

    return {
        gymExerciseRecordSetId,
        gymSessionId,
        value,
        reps:
            kind === 'weight'
                ? row.weightPrReps ?? undefined
                : row.distancePrReps ?? undefined,
        completedAtMs:
            kind === 'weight'
                ? row.weightPrCompletedAtMs ?? undefined
                : row.distancePrCompletedAtMs ?? undefined,
    };
};

const pickBestMetric = (
    candidates: readonly CompletedSetMetricCandidate[],
): CompletedSetMetricCandidate | undefined =>
    [...candidates].sort((left, right) => {
        if (right.value !== left.value) return right.value - left.value;

        return (right.completedAtMs ?? 0) - (left.completedAtMs ?? 0);
    })[0];

export const createExerciseDefinitionStatsRepository = ({
    db,
}: CreateExerciseDefinitionStatsRepositoryArgs): ExerciseDefinitionStatsRepository => {
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

    const getRecentSessions = (
        exerciseDefinitionId: string,
    ): GymSessionListItem[] => {
        const rows = db
            .select({
                id: gymSessionsTable.id,
                startedAtMs: gymSessionsTable.startedAtMs,
                endedAtMs: gymSessionsTable.endedAtMs,
                status: gymSessionsTable.status,
                sourceGymPlanId: gymSessionsTable.sourceGymPlanId,
                sourceGymPlanName: gymPlansTable.name,
            })
            .from(exerciseDefinitionRecentGymSessionsTable)
            .innerJoin(
                gymSessionsTable,
                eq(
                    exerciseDefinitionRecentGymSessionsTable.gymSessionId,
                    gymSessionsTable.id,
                ),
            )
            .leftJoin(
                gymPlansTable,
                eq(gymSessionsTable.sourceGymPlanId, gymPlansTable.id),
            )
            .where(
                eq(
                    exerciseDefinitionRecentGymSessionsTable.exerciseDefinitionId,
                    exerciseDefinitionId,
                ),
            )
            .orderBy(asc(exerciseDefinitionRecentGymSessionsTable.sortIndex))
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
                sourceGymPlanName: row.sourceGymPlanName ?? undefined,
                exerciseRecordCount: counts.exerciseRecordCount,
                setCount: counts.setCount,
            };
        });
    };

    const getCompletedSessionReferences = (
        exerciseDefinitionId: string,
    ): CompletedSessionReference[] => {
        const rows = db
            .select({
                gymSessionId: gymSessionsTable.id,
                startedAtMs: gymSessionsTable.startedAtMs,
            })
            .from(gymExerciseRecordsTable)
            .innerJoin(
                gymSessionsTable,
                eq(
                    gymExerciseRecordsTable.gymSessionId,
                    gymSessionsTable.id,
                ),
            )
            .where(
                and(
                    eq(
                        gymExerciseRecordsTable.exerciseDefinitionId,
                        exerciseDefinitionId,
                    ),
                    eq(gymSessionsTable.status, 'completed'),
                ),
            )
            .orderBy(desc(gymSessionsTable.startedAtMs))
            .all();
        const referencesBySessionId = new Map<
            string,
            CompletedSessionReference
        >();

        rows.forEach((row) => {
            if (referencesBySessionId.has(row.gymSessionId)) return;

            referencesBySessionId.set(row.gymSessionId, row);
        });

        return [...referencesBySessionId.values()]
            .sort((left, right) => right.startedAtMs - left.startedAtMs)
            .slice(0, RECENT_COMPLETED_SESSION_LIMIT);
    };

    const getCompletedSetMetrics = (
        exerciseDefinitionId: string,
    ): {
        distance: CompletedSetMetricCandidate[];
        weight: CompletedSetMetricCandidate[];
    } => {
        const rows = db
            .select({
                completedAtMs: gymExerciseRecordSetsTable.completedAtMs,
                distanceMeters: gymExerciseRecordSetsTable.distanceMeters,
                gymExerciseRecordSetId: gymExerciseRecordSetsTable.id,
                gymSessionId: gymSessionsTable.id,
                isWarmup: gymExerciseRecordSetsTable.isWarmup,
                reps: gymExerciseRecordSetsTable.reps,
                weightGrams: gymExerciseRecordSetsTable.weightGrams,
            })
            .from(gymExerciseRecordSetsTable)
            .innerJoin(
                gymExerciseRecordsTable,
                eq(
                    gymExerciseRecordSetsTable.gymExerciseRecordId,
                    gymExerciseRecordsTable.id,
                ),
            )
            .innerJoin(
                gymSessionsTable,
                eq(
                    gymExerciseRecordsTable.gymSessionId,
                    gymSessionsTable.id,
                ),
            )
            .where(
                and(
                    eq(
                        gymExerciseRecordsTable.exerciseDefinitionId,
                        exerciseDefinitionId,
                    ),
                    eq(gymSessionsTable.status, 'completed'),
                ),
            )
            .all();
        const distance: CompletedSetMetricCandidate[] = [];
        const weight: CompletedSetMetricCandidate[] = [];

        rows.forEach((row) => {
            if (row.isWarmup) return;

            const base = {
                completedAtMs: row.completedAtMs ?? undefined,
                gymExerciseRecordSetId: row.gymExerciseRecordSetId,
                gymSessionId: row.gymSessionId,
                reps: row.reps ?? undefined,
            };

            if (row.weightGrams !== null) {
                weight.push({
                    ...base,
                    value: row.weightGrams,
                });
            }

            if (row.distanceMeters !== null) {
                distance.push({
                    ...base,
                    value: row.distanceMeters,
                });
            }
        });

        return { distance, weight };
    };

    const upsertStats = (
        exerciseDefinitionId: string,
        recentSessions: readonly CompletedSessionReference[],
        weightPr: CompletedSetMetricCandidate | undefined,
        distancePr: CompletedSetMetricCandidate | undefined,
        updatedAtMs: number,
    ): void => {
        const existing = repository.getByExerciseDefinitionId(
            exerciseDefinitionId,
        );
        const row: ExerciseDefinitionStatsInsert = {
            exerciseDefinitionId,
            weightPrSetId: weightPr?.gymExerciseRecordSetId ?? null,
            weightPrGymSessionId: weightPr?.gymSessionId ?? null,
            weightPrGrams: weightPr?.value ?? null,
            weightPrReps: weightPr?.reps ?? null,
            weightPrCompletedAtMs: weightPr?.completedAtMs ?? null,
            distancePrSetId: distancePr?.gymExerciseRecordSetId ?? null,
            distancePrGymSessionId: distancePr?.gymSessionId ?? null,
            distancePrMeters: distancePr?.value ?? null,
            distancePrReps: distancePr?.reps ?? null,
            distancePrCompletedAtMs: distancePr?.completedAtMs ?? null,
            lastCompletedGymSessionId: recentSessions[0]?.gymSessionId ?? null,
            createdAtMs: existing?.createdAtMs ?? updatedAtMs,
            updatedAtMs,
        };
        const recentRows: RecentGymSessionInsert[] = recentSessions.map(
            (session, sortIndex) => ({
                exerciseDefinitionId,
                gymSessionId: session.gymSessionId,
                sortIndex,
                startedAtMs: session.startedAtMs,
                createdAtMs: updatedAtMs,
                updatedAtMs,
            }),
        );

        db.transaction((tx) => {
            tx.delete(exerciseDefinitionRecentGymSessionsTable)
                .where(
                    eq(
                        exerciseDefinitionRecentGymSessionsTable.exerciseDefinitionId,
                        exerciseDefinitionId,
                    ),
                )
                .run();

            tx.insert(exerciseDefinitionStatsTable)
                .values(row)
                .onConflictDoUpdate({
                    target: exerciseDefinitionStatsTable.exerciseDefinitionId,
                    set: {
                        weightPrSetId: row.weightPrSetId,
                        weightPrGymSessionId: row.weightPrGymSessionId,
                        weightPrGrams: row.weightPrGrams,
                        weightPrReps: row.weightPrReps,
                        weightPrCompletedAtMs: row.weightPrCompletedAtMs,
                        distancePrSetId: row.distancePrSetId,
                        distancePrGymSessionId: row.distancePrGymSessionId,
                        distancePrMeters: row.distancePrMeters,
                        distancePrReps: row.distancePrReps,
                        distancePrCompletedAtMs:
                            row.distancePrCompletedAtMs,
                        lastCompletedGymSessionId:
                            row.lastCompletedGymSessionId,
                        updatedAtMs,
                    },
                })
                .run();

            if (recentRows.length > 0) {
                tx.insert(exerciseDefinitionRecentGymSessionsTable)
                    .values(recentRows)
                    .run();
            }
        });
    };

    const clearStats = (exerciseDefinitionId: string): void => {
        db.transaction((tx) => {
            tx.delete(exerciseDefinitionRecentGymSessionsTable)
                .where(
                    eq(
                        exerciseDefinitionRecentGymSessionsTable.exerciseDefinitionId,
                        exerciseDefinitionId,
                    ),
                )
                .run();
            tx.delete(exerciseDefinitionStatsTable)
                .where(
                    eq(
                        exerciseDefinitionStatsTable.exerciseDefinitionId,
                        exerciseDefinitionId,
                    ),
                )
                .run();
        });
    };

    const repository: ExerciseDefinitionStatsRepository = {
        getByExerciseDefinitionId: (
            exerciseDefinitionId: string,
        ): ExerciseDefinitionStats | null => {
            const row = db
                .select()
                .from(exerciseDefinitionStatsTable)
                .where(
                    eq(
                        exerciseDefinitionStatsTable.exerciseDefinitionId,
                        exerciseDefinitionId,
                    ),
                )
                .get();

            if (!row) return null;

            const recentCompletedGymSessions = getRecentSessions(
                exerciseDefinitionId,
            );

            return {
                exerciseDefinitionId: row.exerciseDefinitionId,
                weightPr: metricFromStatsRow(row, 'weight'),
                distancePr: metricFromStatsRow(row, 'distance'),
                lastCompletedGymSession: recentCompletedGymSessions[0],
                recentCompletedGymSessions,
                createdAtMs: row.createdAtMs,
                updatedAtMs: row.updatedAtMs,
            };
        },

        rebuildForExerciseDefinitionIds: ({
            exerciseDefinitionIds,
            updatedAtMs,
        }: RebuildExerciseDefinitionStatsInput): void => {
            const uniqueIds = [...new Set(exerciseDefinitionIds)];
            if (uniqueIds.length === 0) return;

            const existingIds = db
                .select({ id: exerciseDefinitionStatsTable.exerciseDefinitionId })
                .from(exerciseDefinitionStatsTable)
                .where(
                    inArray(
                        exerciseDefinitionStatsTable.exerciseDefinitionId,
                        uniqueIds,
                    ),
                )
                .all()
                .map((row) => row.id);

            uniqueIds.forEach((exerciseDefinitionId) => {
                const recentSessions =
                    getCompletedSessionReferences(exerciseDefinitionId);

                if (
                    recentSessions.length === 0 &&
                    !existingIds.includes(exerciseDefinitionId)
                ) {
                    return;
                }

                if (recentSessions.length === 0) {
                    clearStats(exerciseDefinitionId);
                    return;
                }

                const metrics = getCompletedSetMetrics(exerciseDefinitionId);

                upsertStats(
                    exerciseDefinitionId,
                    recentSessions,
                    pickBestMetric(metrics.weight),
                    pickBestMetric(metrics.distance),
                    updatedAtMs,
                );
            });
        },
    };

    return repository;
};
