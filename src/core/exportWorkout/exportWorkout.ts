import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Workout } from '@src/core/entities/workout.interfaces';
import {
    ARC_WORKOUT_MIME,
    type ExportedWorkoutExerciseV2,
    type ExportedWorkoutFileV2,
    type ExportedWorkoutV2,
} from './exportTypes';

export type ExportResult =
    | { ok: true }
    | {
          ok: false;
          error: 'SHARING_UNAVAILABLE' | 'WRITE_FAILED' | 'SHARE_FAILED';
      };

const sanitizeFilename = (name: string): string => {
    const safe = name
        .replace(/[^\w\s-]/g, '')
        .trim()
        .slice(0, 60);
    return safe.length > 0 ? safe : 'Workout';
};

export const workoutToExportedWorkout = (
    workout: Workout,
): ExportedWorkoutV2 => ({
    name: workout.name,
    blocks: workout.blocks.map((block) => ({
        title: block.title,
        sets: block.sets,
        restBetweenSetsSec: block.restBetweenSetsSec,
        restBetweenExercisesSec: block.restBetweenExercisesSec,
        exercises: block.exercises.map(
            (exercise): ExportedWorkoutExerciseV2 => ({
                name: exercise.name,
                value: exercise.value,
                mode: exercise.mode,
                tempo: exercise.tempo,
            }),
        ),
    })),
});

export const exportWorkoutToFile = async (
    workout: Workout,
): Promise<ExportResult> => {
    const payload: ExportedWorkoutFileV2 = {
        version: 2,
        kind: 'arc-timer/workout',
        exportedAt: new Date().toISOString(),
        app: {
            name: 'ARC Timer',
            platform: 'mobile',
        },
        workout: workoutToExportedWorkout(workout),
    };

    const json = JSON.stringify(payload, null, 2);

    const safeName = sanitizeFilename(workout.name);
    const filename = `${safeName}.arcw`;
    const file = new File(Paths.cache, filename);

    try {
        file.write(json);
    } catch (err) {
        console.warn('Export write failed', err);
        return { ok: false, error: 'WRITE_FAILED' };
    }

    let canShare = false;
    try {
        canShare = await Sharing.isAvailableAsync();
    } catch (err) {
        console.warn('Sharing availability check failed', err);
        return { ok: false, error: 'SHARING_UNAVAILABLE' };
    }

    if (!canShare) {
        return { ok: false, error: 'SHARING_UNAVAILABLE' };
    }

    try {
        await Sharing.shareAsync(file.uri, {
            mimeType: ARC_WORKOUT_MIME,
            dialogTitle: `Share workout "${workout.name}"`,
        });

        return { ok: true };
    } catch (err) {
        console.warn('Share failed', err);
        return { ok: false, error: 'SHARE_FAILED' };
    }
};
