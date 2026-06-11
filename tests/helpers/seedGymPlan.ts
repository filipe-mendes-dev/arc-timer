import type {
    GymPlan,
    GymPlanExercise,
    GymPlanSection,
} from '@src/core/entities/gymPlan.interfaces';
import {
    gymPlanExerciseTargetSetsTable,
    gymPlanExercisesTable,
    gymPlansTable,
    gymPlanSectionsTable,
} from '@src/db/schema';

import type { TestDb } from './createTestDb';

export const seedGymPlan = (testDb: TestDb, gymPlan: GymPlan): GymPlan => {
    testDb.db
        .insert(gymPlansTable)
        .values({
            createdAtMs: gymPlan.createdAtMs,
            description: gymPlan.description ?? null,
            draftTargetGymPlanId: gymPlan.draftTargetGymPlanId ?? null,
            id: gymPlan.id,
            isFavorite: gymPlan.isFavorite,
            name: gymPlan.name ?? '',
            status: gymPlan.status,
            updatedAtMs: gymPlan.updatedAtMs,
        })
        .run();

    gymPlan.sections.forEach((section) => {
        seedGymPlanSection(testDb, gymPlan.id, section);
    });

    return gymPlan;
};

export const seedGymPlanSection = (
    testDb: TestDb,
    gymPlanId: string,
    section: GymPlanSection,
): GymPlanSection => {
    testDb.db
        .insert(gymPlanSectionsTable)
        .values({
            createdAtMs: section.createdAtMs,
            gymPlanId,
            id: section.id,
            sortIndex: section.sortIndex,
            title: section.title ?? null,
            updatedAtMs: section.updatedAtMs,
        })
        .run();

    section.exercises.forEach((exercise) => {
        seedGymPlanExercise(testDb, section.id, exercise);
    });

    return section;
};

export const seedGymPlanExercise = (
    testDb: TestDb,
    gymPlanSectionId: string,
    exercise: GymPlanExercise,
): GymPlanExercise => {
    testDb.db
        .insert(gymPlanExercisesTable)
        .values({
            createdAtMs: exercise.createdAtMs,
            exerciseDefinitionId: exercise.exerciseDefinitionId,
            gymPlanSectionId,
            id: exercise.id,
            notes: exercise.notes ?? null,
            sortIndex: exercise.sortIndex,
            updatedAtMs: exercise.updatedAtMs,
        })
        .run();

    if (exercise.targetSetDrafts && exercise.targetSetDrafts.length > 0) {
        testDb.db
            .insert(gymPlanExerciseTargetSetsTable)
            .values(
                exercise.targetSetDrafts.map((targetSet) => ({
                    createdAtMs: targetSet.createdAtMs,
                    distanceMeters: targetSet.distanceMeters ?? null,
                    durationSec: targetSet.durationSec ?? null,
                    gymPlanExerciseId: exercise.id,
                    id: targetSet.id,
                    reps: targetSet.reps ?? null,
                    rpeTenths: targetSet.rpeTenths ?? null,
                    setIndex: targetSet.setIndex,
                    updatedAtMs: targetSet.updatedAtMs,
                    weightGrams: targetSet.weightGrams ?? null,
                })),
            )
            .run();
    }

    return exercise;
};
