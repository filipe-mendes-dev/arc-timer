import { asc, eq } from 'drizzle-orm';

import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';
import { seedScreenshotDemoData } from '@src/db/migrations/seedScreenshotDemoData';
import {
    exerciseDefinitionRecentGymSessionsTable,
    exerciseDefinitionStatsTable,
    exerciseDefinitionsTable,
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymPlanExercisesTable,
    gymPlanExerciseTargetSetsTable,
    gymPlansTable,
    gymPlanSectionsTable,
    gymSessionsTable,
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutsTable,
    workoutVersionsTable,
} from '@src/db/schema';

import { createTestDb, type TestDb } from '../../../helpers/createTestDb';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

interface SeedSnapshot {
    exerciseRecentSessions: Array<
        typeof exerciseDefinitionRecentGymSessionsTable.$inferSelect
    >;
    exerciseStats: Array<typeof exerciseDefinitionStatsTable.$inferSelect>;
    gymExerciseRecords: Array<typeof gymExerciseRecordsTable.$inferSelect>;
    gymExerciseRecordSets: Array<
        typeof gymExerciseRecordSetsTable.$inferSelect
    >;
    gymPlanExercises: Array<typeof gymPlanExercisesTable.$inferSelect>;
    gymPlanExerciseTargetSets: Array<
        typeof gymPlanExerciseTargetSetsTable.$inferSelect
    >;
    gymPlans: Array<typeof gymPlansTable.$inferSelect>;
    gymPlanSections: Array<typeof gymPlanSectionsTable.$inferSelect>;
    gymSessions: Array<typeof gymSessionsTable.$inferSelect>;
    workoutBlocks: Array<typeof workoutBlocksTable.$inferSelect>;
    workoutExercises: Array<typeof workoutExercisesTable.$inferSelect>;
    workoutSessions: Array<typeof workoutSessionsTable.$inferSelect>;
    workoutVersions: Array<typeof workoutVersionsTable.$inferSelect>;
    workouts: Array<typeof workoutsTable.$inferSelect>;
}

const getDefinitionByNameOrThrow = (testDb: TestDb, name: string) => {
    const definition = testDb.db
        .select()
        .from(exerciseDefinitionsTable)
        .where(
            eq(
                exerciseDefinitionsTable.normalizedName,
                normalizeExerciseName(name),
            ),
        )
        .get();

    expect(definition).toBeDefined();
    if (!definition) {
        throw new Error(`Expected exercise definition ${name}`);
    }

    return definition;
};

const readSeedSnapshot = (testDb: TestDb): SeedSnapshot => ({
    exerciseRecentSessions: testDb.db
        .select()
        .from(exerciseDefinitionRecentGymSessionsTable)
        .orderBy(
            asc(exerciseDefinitionRecentGymSessionsTable.exerciseDefinitionId),
            asc(exerciseDefinitionRecentGymSessionsTable.sortIndex),
        )
        .all(),
    exerciseStats: testDb.db
        .select()
        .from(exerciseDefinitionStatsTable)
        .orderBy(asc(exerciseDefinitionStatsTable.exerciseDefinitionId))
        .all(),
    gymExerciseRecords: testDb.db
        .select()
        .from(gymExerciseRecordsTable)
        .orderBy(asc(gymExerciseRecordsTable.id))
        .all(),
    gymExerciseRecordSets: testDb.db
        .select()
        .from(gymExerciseRecordSetsTable)
        .orderBy(asc(gymExerciseRecordSetsTable.id))
        .all(),
    gymPlanExercises: testDb.db
        .select()
        .from(gymPlanExercisesTable)
        .orderBy(asc(gymPlanExercisesTable.id))
        .all(),
    gymPlanExerciseTargetSets: testDb.db
        .select()
        .from(gymPlanExerciseTargetSetsTable)
        .orderBy(asc(gymPlanExerciseTargetSetsTable.id))
        .all(),
    gymPlans: testDb.db
        .select()
        .from(gymPlansTable)
        .orderBy(asc(gymPlansTable.id))
        .all(),
    gymPlanSections: testDb.db
        .select()
        .from(gymPlanSectionsTable)
        .orderBy(asc(gymPlanSectionsTable.id))
        .all(),
    gymSessions: testDb.db
        .select()
        .from(gymSessionsTable)
        .orderBy(asc(gymSessionsTable.id))
        .all(),
    workoutBlocks: testDb.db
        .select()
        .from(workoutBlocksTable)
        .orderBy(asc(workoutBlocksTable.id))
        .all(),
    workoutExercises: testDb.db
        .select()
        .from(workoutExercisesTable)
        .orderBy(asc(workoutExercisesTable.id))
        .all(),
    workoutSessions: testDb.db
        .select()
        .from(workoutSessionsTable)
        .orderBy(asc(workoutSessionsTable.id))
        .all(),
    workoutVersions: testDb.db
        .select()
        .from(workoutVersionsTable)
        .orderBy(asc(workoutVersionsTable.id))
        .all(),
    workouts: testDb.db
        .select()
        .from(workoutsTable)
        .orderBy(asc(workoutsTable.id))
        .all(),
});

describe('seedScreenshotDemoData', () => {
    let testDb: TestDb;

    beforeEach(() => {
        testDb = createTestDb();
    });

    afterEach(() => {
        testDb.close();
    });

    it('creates the screenshot demo library and completed history', async () => {
        await seedScreenshotDemoData(testDb.db);

        const workoutNames = testDb.dbServices.workoutService
            .getAll()
            .map((workout) => workout.name);
        const gymPlanNames = testDb.dbServices.gymPlanService
            .listGymPlanItems()
            .map((plan) => plan.name);
        const trainingSessions =
            testDb.dbServices.trainingSessionService.listItems({ limit: 20 });

        expect(workoutNames).toEqual([
            'Power Lactic',
            'Full Body HIIT',
            'Core Burner',
            'Cardio Blast',
            'Leg Drive',
            'Upper Cut',
            'Quick Sweat',
        ]);
        expect(gymPlanNames).toEqual([
            'Upper Body Strength',
            'Lower Body Strength',
            'Push Day',
            'Pull Day',
            'Full Body A',
            'Hypertrophy Upper',
            'Core Stability',
        ]);
        expect(trainingSessions).toHaveLength(8);
        expect(trainingSessions[0]).toMatchObject({
            id: 'screenshot-gym-session-upper-body-strength',
            kind: 'gym',
            sourceGymPlanName: 'Upper Body Strength',
        });
        expect(trainingSessions[1]).toMatchObject({
            id: 'screenshot-hiit-session-power-today',
            kind: 'hiit',
            title: 'Power Lactic',
        });

        const powerSession = testDb.dbServices.workoutSessionService.getById(
            'screenshot-hiit-session-power-today',
        );

        expect(powerSession?.stats).toMatchObject({
            completedSetsByBlock: [2, 3, 1],
            completedExercisesByBlock: [6, 9, 2],
        });
    });

    it('creates expected exercise definitions without duplicating system definitions', async () => {
        await seedScreenshotDemoData(testDb.db);

        const pullUpRows = testDb.db
            .select()
            .from(exerciseDefinitionsTable)
            .where(
                eq(
                    exerciseDefinitionsTable.normalizedName,
                    normalizeExerciseName('Pull-Up'),
                ),
            )
            .all();
        const barbellRow = getDefinitionByNameOrThrow(testDb, 'Barbell Row');

        expect(pullUpRows).toHaveLength(1);
        expect(pullUpRows[0]).toMatchObject({
            name: 'Pull Up',
            source: 'system',
        });
        expect(barbellRow).toMatchObject({
            id: 'screenshot-exercise-barbell-row',
            source: 'user',
            availability: 'both',
        });
    });

    it('populates personal records and recent completed sessions', async () => {
        await seedScreenshotDemoData(testDb.db);

        const benchPress =
            testDb.dbServices.exerciseDefinitionService.getByNormalizedName(
                normalizeExerciseName('Bench Press'),
            );
        const deadlift =
            testDb.dbServices.exerciseDefinitionService.getByNormalizedName(
                normalizeExerciseName('Deadlift'),
            );
        const plank =
            testDb.dbServices.exerciseDefinitionService.getByNormalizedName(
                normalizeExerciseName('Plank'),
            );

        expect(benchPress?.stats?.weightPr).toMatchObject({
            gymSessionId: 'screenshot-gym-session-upper-body-strength',
            value: 82_500,
            reps: 5,
        });
        expect(
            benchPress?.stats?.recentCompletedGymSessions.map(
                (session) => session.sourceGymPlanName,
            ),
        ).toEqual(['Upper Body Strength', 'Push Day']);
        expect(deadlift?.stats?.weightPr).toMatchObject({
            gymSessionId: 'screenshot-gym-session-lower-body-strength',
            value: 145_000,
            reps: 3,
        });
        expect(plank?.stats?.weightPr).toBeUndefined();
        expect(plank?.stats?.lastCompletedGymSession).toMatchObject({
            sourceGymPlanName: 'Lower Body Strength',
        });
    });

    it('produces the same persisted demo state when run repeatedly', async () => {
        await seedScreenshotDemoData(testDb.db);
        const firstSnapshot = readSeedSnapshot(testDb);

        await seedScreenshotDemoData(testDb.db);
        const secondSnapshot = readSeedSnapshot(testDb);

        expect(secondSnapshot).toEqual(firstSnapshot);
    });
});
