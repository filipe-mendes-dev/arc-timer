import type { UUID } from '../entities/common.interfaces';
import type { ExerciseMode } from '../entities/workout.interfaces';

export const ARC_WORKOUT_KIND = 'arc-timer/workout' as const;
export const ARC_WORKOUT_EXTENSION = '.arcw' as const;
export const ARC_WORKOUT_MIME =
    'application/vnd.arctimer.workout+json' as const;

export type ArcWorkoutKind = typeof ARC_WORKOUT_KIND;

export interface ExportedWorkoutV1 {
    id: UUID;
    name: string;
    blocks: ExportedWorkoutBlockV1[];
    updatedAtMs?: number;
    isFavorite?: boolean;
}

export interface ExportedWorkoutBlockV1 {
    id: UUID;
    title?: string;
    sets: number;
    restBetweenSetsSec: number;
    restBetweenExercisesSec: number;
    exercises: ExportedWorkoutExerciseV1[];
}

export interface ExportedWorkoutExerciseV1 {
    id: UUID;
    name?: string;
    value: number;
    mode: ExerciseMode;
    tempo?: string;
}

export interface ExportedWorkoutFileV1 {
    version: 1;
    kind: ArcWorkoutKind;
    exportedAt: string;
    app: {
        name: string;
        platform: 'mobile';
    };
    workout: ExportedWorkoutV1;
}

export interface ExportedWorkoutExerciseV2 {
    name?: string;
    exerciseDefinitionId?: UUID;
    value: number;
    mode: ExerciseMode;
    tempo?: string;
}

export interface ExportedWorkoutBlockV2 {
    title?: string;
    sets: number;
    restBetweenSetsSec: number;
    restBetweenExercisesSec: number;
    exercises: ExportedWorkoutExerciseV2[];
}

export interface ExportedWorkoutV2 {
    name: string;
    blocks: ExportedWorkoutBlockV2[];
}

export interface ExportedWorkoutFileV2 {
    version: 2;
    kind: ArcWorkoutKind;
    exportedAt: string;
    app: {
        name: string;
        platform: 'mobile';
    };
    workout: ExportedWorkoutV2;
}
