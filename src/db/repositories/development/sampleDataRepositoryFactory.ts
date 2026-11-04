import { and, eq, exists, not, or, sql } from 'drizzle-orm';
import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';
import {
    exerciseDefinitionsTable as definitions,
    gymSessionsTable as sessions,
    gymExerciseRecordsTable as records,
    gymExerciseRecordSetsTable as sets,
    gymPlanExercisesTable as planExercises,
    workoutExercisesTable as workoutExercises,
} from '../../schema';

export interface SampleSessionInput {
    session: typeof sessions.$inferInsert;
    records: Array<typeof records.$inferInsert>;
    sets: Array<typeof sets.$inferInsert>;
}

export const createSampleDataRepository = ({ db }: { db: RepositoryDb }) => ({
    listSampleExerciseIds: () =>
        db
            .selectDistinct({ id: records.exerciseDefinitionId })
            .from(records)
            .innerJoin(sessions, eq(sessions.id, records.gymSessionId))
            .where(sql`${sessions.id} glob ${'dev-sample-*'}`)
            .all()
            .map((row) => row.id),
    findExercise: (name: string, sampleId: string) =>
        db
            .select()
            .from(definitions)
            .where(
                or(
                    eq(definitions.normalizedName, normalizeExerciseName(name)),
                    eq(definitions.id, sampleId),
                ),
            )
            .get(),
    insertDefinition: (id: string, name: string, now: number) => {
        db.insert(definitions)
            .values({
                id,
                name,
                normalizedName: normalizeExerciseName(name),
                source: 'user',
                availability: 'both',
                createdAtMs: now,
                updatedAtMs: now,
            })
            .run();
    },
    insertSession: (input: SampleSessionInput) => {
        db.insert(sessions).values(input.session).run();
        db.insert(records).values(input.records).run();
        db.insert(sets).values(input.sets).run();
    },
    deleteSampleSessions: () => {
        db.delete(sessions)
            .where(sql`${sessions.id} glob ${'dev-sample-*'}`)
            .run();
    },
    deleteUnusedSampleDefinitions: () => {
        db.delete(definitions)
            .where(
                and(
                    sql`${definitions.id} glob ${'dev-sample-*'}`,
                    not(
                        exists(
                            db
                                .select({ id: records.id })
                                .from(records)
                                .where(
                                    eq(records.exerciseDefinitionId, definitions.id),
                                ),
                        ),
                    ),
                    not(
                        exists(
                            db
                                .select({ id: planExercises.id })
                                .from(planExercises)
                                .where(
                                    eq(
                                        planExercises.exerciseDefinitionId,
                                        definitions.id,
                                    ),
                                ),
                        ),
                    ),
                    not(
                        exists(
                            db
                                .select({ id: workoutExercises.id })
                                .from(workoutExercises)
                                .where(
                                    eq(
                                        workoutExercises.exerciseDefinitionId,
                                        definitions.id,
                                    ),
                                ),
                        ),
                    ),
                ),
            )
            .run();
    },
});
