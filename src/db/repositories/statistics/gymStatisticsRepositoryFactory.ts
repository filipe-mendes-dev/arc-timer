import { and, asc, eq, gte, isNotNull, lt } from 'drizzle-orm';

import type { StatisticsRange } from '@src/core/statistics/gymStatistics';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';
import {
    exerciseDefinitionsTable,
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymSessionsTable,
} from '../../schema';

export interface CompletedGymSetRow {
    exerciseDefinitionId: string;
    exerciseName: string;
    sessionId: string;
    sessionName: string | null;
    startedAtMs: number;
    endedAtMs: number | null;
    isWarmup: boolean;
    reps: number | null;
    weightGrams: number | null;
    durationSec: number | null;
    distanceMeters: number | null;
}

export interface GymStatisticsRepository {
    listCompletedSets: (
        range: StatisticsRange,
        exerciseDefinitionId?: string,
    ) => CompletedGymSetRow[];
}

export const createGymStatisticsRepository = ({
    db,
}: {
    db: RepositoryDb;
}): GymStatisticsRepository => ({
    listCompletedSets: (range, exerciseDefinitionId) =>
        db
            .select({
                exerciseDefinitionId: gymExerciseRecordsTable.exerciseDefinitionId,
                exerciseName: exerciseDefinitionsTable.name,
                sessionId: gymSessionsTable.id,
                sessionName: gymSessionsTable.sourceGymPlanName,
                startedAtMs: gymSessionsTable.startedAtMs,
                endedAtMs: gymSessionsTable.endedAtMs,
                isWarmup: gymExerciseRecordSetsTable.isWarmup,
                reps: gymExerciseRecordSetsTable.reps,
                weightGrams: gymExerciseRecordSetsTable.weightGrams,
                durationSec: gymExerciseRecordSetsTable.durationSec,
                distanceMeters: gymExerciseRecordSetsTable.distanceMeters,
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
                eq(gymExerciseRecordsTable.gymSessionId, gymSessionsTable.id),
            )
            .innerJoin(
                exerciseDefinitionsTable,
                eq(
                    gymExerciseRecordsTable.exerciseDefinitionId,
                    exerciseDefinitionsTable.id,
                ),
            )
            .where(
                and(
                    eq(gymSessionsTable.status, 'completed'),
                    isNotNull(gymExerciseRecordSetsTable.completedAtMs),
                    lt(gymSessionsTable.startedAtMs, range.endedBeforeMs),
                    range.startedAtMs === undefined ? undefined : gte(gymSessionsTable.startedAtMs, range.startedAtMs),
                    exerciseDefinitionId === undefined ? undefined : eq( gymExerciseRecordsTable.exerciseDefinitionId, exerciseDefinitionId, ),
                ),
            )
            .orderBy(asc(gymSessionsTable.startedAtMs), asc(gymSessionsTable.id))
            .all(),
});
