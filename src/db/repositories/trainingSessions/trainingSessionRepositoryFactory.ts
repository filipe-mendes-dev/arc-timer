import {
    and,
    count,
    countDistinct,
    desc,
    eq,
    exists,
    gte,
    lt,
    type SQL,
} from 'drizzle-orm';
import type {
    TrainingSessionListParams,
    TrainingSessionKind,
} from '@src/core/entities/trainingSession.interfaces';
import type { StatisticsRange } from '@src/core/statistics/gymStatistics';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';
import {
    gymSessionsTable as sessions,
    gymExerciseRecordsTable as records,
    gymExerciseRecordSetsTable as sets,
    workoutSessionsTable as hiit,
    workoutVersionsTable as versions,
    workoutBlocksTable as blocks,
    workoutExercisesTable as exercises,
} from '../../schema';

export interface TrainingSessionRow {
    id: string;
    kind: TrainingSessionKind;
    title: string;
    startedAtMs: number;
    endedAtMs: number | null;
    durationSec: number | null;
    statsJson: string | null;
    exerciseCount: number;
    setCount: number;
}

export interface TrainingSessionRepository {
    listItems: (input: TrainingSessionListParams) => TrainingSessionRow[];
    listExerciseSessions: (
        range: StatisticsRange,
        exerciseDefinitionId?: string,
    ) => ExerciseSessionRow[];
}

export interface ExerciseSessionRow {
    exerciseDefinitionId: string | null;
    sessionId: string;
    kind: TrainingSessionKind;
    startedAtMs: number;
}

export const createTrainingSessionRepository = ({
    db,
}: {
    db: RepositoryDb;
}): TrainingSessionRepository => ({
    listItems: (input) => {
        const pageSize = input.limit ?? Number.MAX_SAFE_INTEGER;
        const readLimit = Math.min(
            Number.MAX_SAFE_INTEGER,
            pageSize + (input.offset ?? 0),
        );
        const queryLimit = input.search?.trim() ? Number.MAX_SAFE_INTEGER : readLimit;
        const rows: TrainingSessionRow[] = [];
        const search = input.search?.trim();
        if (input.kind !== 'hiit') {
            const conditions = [eq(sessions.status, 'completed')];
            if (input.startedAtMs !== undefined)
                conditions.push(gte(sessions.startedAtMs, input.startedAtMs));
            if (input.endedBeforeMs !== undefined)
                conditions.push(lt(sessions.startedAtMs, input.endedBeforeMs));
            if (input.exerciseDefinitionId !== undefined)
                conditions.push(
                    exists(
                        db
                            .select({ id: records.id })
                            .from(records)
                            .where(
                                and(
                                    eq(records.gymSessionId, sessions.id),
                                    eq(
                                        records.exerciseDefinitionId,
                                        input.exerciseDefinitionId,
                                    ),
                                ),
                            ),
                    ),
                );
            const gymRows = db
                .select({
                    id: sessions.id,
                    title: sessions.sourceGymPlanName,
                    startedAtMs: sessions.startedAtMs,
                    endedAtMs: sessions.endedAtMs,
                    exerciseCount: countDistinct(records.id),
                    setCount: count(sets.id),
                })
                .from(sessions)
                .leftJoin(records, eq(records.gymSessionId, sessions.id))
                .leftJoin(sets, eq(sets.gymExerciseRecordId, records.id))
                .where(and(...conditions))
                .groupBy(sessions.id)
                .orderBy(desc(sessions.startedAtMs), desc(sessions.id))
                .limit(queryLimit)
                .all();
            gymRows.forEach((row) =>
                rows.push({
                    ...row,
                    title: row.title ?? '',
                    kind: 'gym',
                    durationSec: null,
                    statsJson: null,
                }),
            );
        }
        if (input.kind !== 'gym') {
            const conditions: SQL[] = [];
            if (input.startedAtMs !== undefined)
                conditions.push(gte(hiit.startedAtMs, input.startedAtMs));
            if (input.endedBeforeMs !== undefined)
                conditions.push(lt(hiit.startedAtMs, input.endedBeforeMs));
            if (input.exerciseDefinitionId !== undefined)
                conditions.push(
                    exists(
                        db
                            .select({ id: exercises.id })
                            .from(exercises)
                            .innerJoin(blocks, eq(exercises.blockId, blocks.id))
                            .where(
                                and(
                                    eq(
                                        blocks.workoutVersionId,
                                        hiit.workoutVersionId,
                                    ),
                                    eq(
                                        exercises.exerciseDefinitionId,
                                        input.exerciseDefinitionId,
                                    ),
                                ),
                            ),
                    ),
                );
            const hiitRows = db
                .select({
                    id: hiit.id,
                    title: versions.name,
                    startedAtMs: hiit.startedAtMs,
                    endedAtMs: hiit.endedAtMs,
                    durationSec: hiit.totalDurationSec,
                    statsJson: hiit.statsJson,
                })
                .from(hiit)
                .innerJoin(versions, eq(versions.id, hiit.workoutVersionId))
                .where(and(...conditions))
                .orderBy(desc(hiit.startedAtMs), desc(hiit.id))
                .limit(queryLimit)
                .all();
            hiitRows.forEach((row) =>
                rows.push({ ...row, kind: 'hiit', exerciseCount: 0, setCount: 0 }),
            );
        }
        return rows
            .filter(
                (row) =>
                    !search ||
                    row.title.toLowerCase().includes(search.toLowerCase()),
            )
            .sort(
                (a, b) =>
                    b.startedAtMs - a.startedAtMs ||
                    b.id.localeCompare(a.id) ||
                    a.kind.localeCompare(b.kind),
            )
            .slice(input.offset ?? 0, readLimit);
    },
    listExerciseSessions: (range, exerciseDefinitionId) => {
        const gymConditions = [
            eq(sessions.status, 'completed'),
            lt(sessions.startedAtMs, range.endedBeforeMs),
        ];
        const hiitConditions = [lt(hiit.startedAtMs, range.endedBeforeMs)];
        if (range.startedAtMs !== undefined) {
            gymConditions.push(gte(sessions.startedAtMs, range.startedAtMs));
            hiitConditions.push(gte(hiit.startedAtMs, range.startedAtMs));
        }
        if (exerciseDefinitionId !== undefined) {
            gymConditions.push(eq(records.exerciseDefinitionId, exerciseDefinitionId));
            hiitConditions.push(eq(exercises.exerciseDefinitionId, exerciseDefinitionId));
        }
        const gymRows = db
            .selectDistinct({
                exerciseDefinitionId: records.exerciseDefinitionId,
                sessionId: sessions.id,
                startedAtMs: sessions.startedAtMs,
            })
            .from(sessions)
            .innerJoin(records, eq(records.gymSessionId, sessions.id))
            .where(and(...gymConditions))
            .all();
        const hiitRows = db
            .selectDistinct({
                exerciseDefinitionId: exercises.exerciseDefinitionId,
                sessionId: hiit.id,
                startedAtMs: hiit.startedAtMs,
            })
            .from(hiit)
            .innerJoin(blocks, eq(blocks.workoutVersionId, hiit.workoutVersionId))
            .innerJoin(exercises, eq(exercises.blockId, blocks.id))
            .where(and(...hiitConditions))
            .all();
        return [
            ...gymRows.map((row): ExerciseSessionRow => ({ ...row, kind: 'gym' })),
            ...hiitRows.map((row): ExerciseSessionRow => ({ ...row, kind: 'hiit' })),
        ];
    },
});
