import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import { getGymPlanExerciseTargetSets } from '@src/core/gyms/gymPlanTargetSets';
import {
    ARC_GYM_PLAN_MIME,
    type ExportedGymPlanFileV1,
    type ExportedGymPlanV1,
} from './exportTypes';

export type ExportGymPlanResult =
    | { ok: true }
    | {
          ok: false;
          error:
              | 'MISSING_EXERCISE_NAMES'
              | 'SHARING_UNAVAILABLE'
              | 'WRITE_FAILED'
              | 'SHARE_FAILED';
      };

const sanitizeFilename = (name: string): string => {
    const safe = name
        .replace(/[^\w\s-]/g, '')
        .trim()
        .slice(0, 60);

    return safe.length > 0 ? safe : 'Gym Plan';
};

const getPortableExerciseName = (
    gymPlanExerciseName: string | undefined,
    exerciseDefinitionId: string,
    exerciseNameById: ReadonlyMap<string, string>,
): string =>
    (gymPlanExerciseName ?? exerciseNameById.get(exerciseDefinitionId) ?? '')
        .trim();

export const gymPlanToExportedGymPlan = (
    gymPlan: GymPlan,
    exerciseNameById: ReadonlyMap<string, string>,
): ExportedGymPlanV1 => ({
    name: gymPlan.name,
    description: gymPlan.description,
    sections: gymPlan.sections.map((section, sectionIndex) => ({
        title: section.title,
        sortIndex: sectionIndex,
        exercises: section.exercises.map((exercise, exerciseIndex) => ({
            name: getPortableExerciseName(
                exercise.name,
                exercise.exerciseDefinitionId,
                exerciseNameById,
            ),
            sortIndex: exerciseIndex,
            notes: exercise.notes,
            targetSets: getGymPlanExerciseTargetSets(exercise).map(
                (targetSet, targetSetIndex) => ({
                    setIndex: targetSetIndex,
                    reps: targetSet.reps,
                    weightGrams: targetSet.weightGrams,
                    durationSec: targetSet.durationSec,
                    distanceMeters: targetSet.distanceMeters,
                    rpeTenths: targetSet.rpeTenths,
                }),
            ),
        })),
    })),
});

const hasMissingExerciseNames = (gymPlan: ExportedGymPlanV1): boolean =>
    gymPlan.sections.some((section) =>
        section.exercises.some((exercise) => exercise.name.length === 0),
    );

export const exportGymPlanToFile = async (
    gymPlan: GymPlan,
    exerciseNameById: ReadonlyMap<string, string>,
): Promise<ExportGymPlanResult> => {
    const exportedGymPlan = gymPlanToExportedGymPlan(
        gymPlan,
        exerciseNameById,
    );

    if (hasMissingExerciseNames(exportedGymPlan)) {
        return { ok: false, error: 'MISSING_EXERCISE_NAMES' };
    }

    const payload: ExportedGymPlanFileV1 = {
        version: 1,
        kind: 'arc-timer/gym-plan',
        exportedAt: new Date().toISOString(),
        app: {
            name: 'ARC Timer',
            platform: 'mobile',
        },
        gymPlan: exportedGymPlan,
    };

    const json = JSON.stringify(payload, null, 2);
    const safeName = sanitizeFilename(gymPlan.name ?? 'Gym Plan');
    const filename = `${safeName}.arcgp`;
    const file = new File(Paths.cache, filename);

    try {
        file.write(json);
    } catch (error: unknown) {
        console.warn('Gym plan export write failed', error);
        return { ok: false, error: 'WRITE_FAILED' };
    }

    let canShare = false;
    try {
        canShare = await Sharing.isAvailableAsync();
    } catch (error: unknown) {
        console.warn('Gym plan sharing availability check failed', error);
        return { ok: false, error: 'SHARING_UNAVAILABLE' };
    }

    if (!canShare) {
        return { ok: false, error: 'SHARING_UNAVAILABLE' };
    }

    try {
        await Sharing.shareAsync(file.uri, {
            mimeType: ARC_GYM_PLAN_MIME,
            dialogTitle: `Share gym plan "${gymPlan.name ?? 'Gym Plan'}"`,
        });

        return { ok: true };
    } catch (error: unknown) {
        console.warn('Gym plan share failed', error);
        return { ok: false, error: 'SHARE_FAILED' };
    }
};
