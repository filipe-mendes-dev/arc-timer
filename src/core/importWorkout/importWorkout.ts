import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import type { ExerciseMode, Workout } from '../entities/workout.interfaces';
import type {
    ExportedWorkoutExerciseV1,
    ExportedWorkoutBlockV1,
} from '../exportWorkout/exportTypes';
import {
    ARC_WORKOUT_EXTENSION,
    ARC_WORKOUT_KIND,
    type ExportedWorkoutV1,
    type ExportedWorkoutBlockV2,
    type ExportedWorkoutExerciseV2,
    type ExportedWorkoutFileV1,
    type ExportedWorkoutFileV2,
    type ExportedWorkoutV2,
} from '../exportWorkout/exportTypes';
import { uid } from '../id';

export type ImportResult =
    | { ok: true; workout: Workout }
    | {
          ok: false;
          error:
              | 'CANCELLED'
              | 'READ_FAILED'
              | 'PARSE_FAILED'
              | 'INVALID_EXTENSION'
              | 'INVALID_KIND'
              | 'INVALID_SHAPE';
      };

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isOptionalString = (value: unknown): value is string | undefined =>
    value === undefined || typeof value === 'string';

const isExerciseMode = (value: unknown): value is ExerciseMode =>
    value === 'time' || value === 'reps';

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const isNonNegativeNumber = (value: unknown): value is number =>
    isFiniteNumber(value) && value >= 0;

const isPositiveNumber = (value: unknown): value is number =>
    isFiniteNumber(value) && value > 0;

const isOptionalNumber = (value: unknown): value is number | undefined =>
    value === undefined || typeof value === 'number';

const isOptionalBoolean = (value: unknown): value is boolean | undefined =>
    value === undefined || typeof value === 'boolean';

const isExportedWorkoutExerciseV1 = (
    value: unknown,
): value is ExportedWorkoutExerciseV1 => {
    if (!isRecord(value)) return false;

    return (
        typeof value.id === 'string' &&
        isExerciseMode(value.mode) &&
        typeof value.value === 'number' &&
        isOptionalString(value.name) &&
        isOptionalString(value.tempo)
    );
};

const isExportedWorkoutBlockV1 = (
    value: unknown,
): value is ExportedWorkoutBlockV1 => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.exercises)) return false;

    return (
        typeof value.id === 'string' &&
        isOptionalString(value.title) &&
        typeof value.sets === 'number' &&
        typeof value.restBetweenSetsSec === 'number' &&
        typeof value.restBetweenExercisesSec === 'number' &&
        value.exercises.every(isExportedWorkoutExerciseV1)
    );
};

const isExportedWorkoutV1 = (value: unknown): value is ExportedWorkoutV1 => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.blocks)) return false;

    return (
        typeof value.id === 'string' &&
        typeof value.name === 'string' &&
        isOptionalNumber(value.updatedAtMs) &&
        isOptionalBoolean(value.isFavorite) &&
        value.blocks.every(isExportedWorkoutBlockV1)
    );
};

const isExportedWorkoutExerciseV2 = (
    value: unknown,
): value is ExportedWorkoutExerciseV2 => {
    if (!isRecord(value)) return false;

    return (
        isOptionalString(value.name) &&
        isPositiveNumber(value.value) &&
        isExerciseMode(value.mode) &&
        isOptionalString(value.tempo)
    );
};

const isExportedWorkoutBlockV2 = (
    value: unknown,
): value is ExportedWorkoutBlockV2 => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.exercises)) return false;

    return (
        isOptionalString(value.title) &&
        isPositiveNumber(value.sets) &&
        isNonNegativeNumber(value.restBetweenSetsSec) &&
        isNonNegativeNumber(value.restBetweenExercisesSec) &&
        value.exercises.every(isExportedWorkoutExerciseV2)
    );
};

const isExportedWorkoutV2 = (value: unknown): value is ExportedWorkoutV2 => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.blocks)) return false;

    return (
        typeof value.name === 'string' &&
        value.blocks.every(isExportedWorkoutBlockV2)
    );
};

const isExportedWorkoutFileEnvelope = (
    value: unknown,
    version: 1 | 2,
): value is Record<string, unknown> => {
    if (!isRecord(value)) return false;

    return (
        value.version === version &&
        value.kind === ARC_WORKOUT_KIND &&
        typeof value.exportedAt === 'string' &&
        isRecord(value.app) &&
        typeof value.app.name === 'string' &&
        value.app.platform === 'mobile'
    );
};

const isExportedWorkoutFileV1 = (
    value: unknown,
): value is ExportedWorkoutFileV1 => {
    if (!isExportedWorkoutFileEnvelope(value, 1)) return false;

    return isExportedWorkoutV1(value.workout);
};

const isExportedWorkoutFileV2 = (
    value: unknown,
): value is ExportedWorkoutFileV2 => {
    if (!isExportedWorkoutFileEnvelope(value, 2)) return false;

    return isExportedWorkoutV2(value.workout);
};

export const exportedWorkoutV1ToExportedWorkoutV2 = (
    workout: ExportedWorkoutV1,
): ExportedWorkoutV2 => ({
    name: workout.name,
    blocks: workout.blocks.map((block) => ({
        title: block.title,
        sets: block.sets,
        restBetweenSetsSec: block.restBetweenSetsSec,
        restBetweenExercisesSec: block.restBetweenExercisesSec,
        exercises: block.exercises.map((exercise) => ({
            name: exercise.name,
            value: exercise.value,
            mode: exercise.mode,
            tempo: exercise.tempo,
        })),
    })),
});

interface ExportedWorkoutToWorkoutInput {
    workout: ExportedWorkoutV2;
    createId?: () => string;
    nowMs?: number;
}

export const exportedWorkoutToWorkout = ({
    workout,
    createId = uid,
    nowMs = Date.now(),
}: ExportedWorkoutToWorkoutInput): Workout => {
    const blocks = workout.blocks.map((block) => ({
        id: createId(),
        title: block.title,
        sets: block.sets,
        restBetweenSetsSec: block.restBetweenSetsSec,
        restBetweenExercisesSec: block.restBetweenExercisesSec,
        exercises: block.exercises.map((exercise) => ({
            id: createId(),
            name: exercise.name,
            value: exercise.value,
            mode: exercise.mode,
            tempo: exercise.tempo,
        })),
    }));

    const exerciseCount = blocks.reduce(
        (count, block) => count + block.exercises.length,
        0,
    );

    return {
        id: createId(),
        name: workout.name,
        blocks,
        updatedAtMs: nowMs,
        isFavorite: false,
        blockCount: blocks.length,
        exerciseCount,
    };
};

interface ParseImportedWorkoutOptions {
    createId?: () => string;
    nowMs?: number;
}

export const parseImportedWorkoutFileContent = (
    contents: string,
    options?: ParseImportedWorkoutOptions,
): ImportResult => {
    let parsedUnknown: unknown;

    try {
        parsedUnknown = JSON.parse(contents) as unknown;
    } catch (error: unknown) {
        console.warn('PARSE_FAILED', error);
        return { ok: false, error: 'PARSE_FAILED' };
    }

    return parseImportedWorkoutUnknown(parsedUnknown, options);
};

export const parseImportedWorkoutUnknown = (
    parsedUnknown: unknown,
    options?: ParseImportedWorkoutOptions,
): ImportResult => {
    if (isRecord(parsedUnknown) && 'kind' in parsedUnknown) {
        if (parsedUnknown.kind !== ARC_WORKOUT_KIND) {
            console.warn('INVALID_KIND', parsedUnknown.kind);
            return { ok: false, error: 'INVALID_KIND' };
        }
    }

    if (isExportedWorkoutFileV2(parsedUnknown)) {
        return {
            ok: true,
            workout: exportedWorkoutToWorkout({
                workout: parsedUnknown.workout,
                createId: options?.createId,
                nowMs: options?.nowMs,
            }),
        };
    }

    if (isExportedWorkoutFileV1(parsedUnknown)) {
        return {
            ok: true,
            workout: exportedWorkoutToWorkout({
                workout: exportedWorkoutV1ToExportedWorkoutV2(
                    parsedUnknown.workout,
                ),
                createId: options?.createId,
                nowMs: options?.nowMs,
            }),
        };
    }

    console.warn('INVALID_SHAPE');
    return { ok: false, error: 'INVALID_SHAPE' };
};

export const importWorkoutFromFile = async (): Promise<ImportResult> => {
    const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
    });

    if (result.canceled) {
        return { ok: false, error: 'CANCELLED' };
    }

    const asset = result.assets[0];

    if (!asset.name.toLowerCase().endsWith(ARC_WORKOUT_EXTENSION)) {
        return { ok: false, error: 'INVALID_EXTENSION' };
    }

    let contents: string;

    try {
        const file = new File(asset.uri);
        contents = await file.text();
    } catch (error: unknown) {
        console.warn('READ_FAILED', error);
        return { ok: false, error: 'READ_FAILED' };
    }

    return parseImportedWorkoutFileContent(contents);
};
