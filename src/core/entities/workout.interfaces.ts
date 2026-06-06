import type { UUID } from './common.interfaces';

/**
 * - 'time' → value is seconds
 * - 'reps' → value is reps (tempo may optionally describe cadence)
 */
export type ExerciseMode = 'time' | 'reps';

export interface WorkoutExercise {
    id: UUID;
    name?: string;
    exerciseDefinitionId?: UUID;
    value: number;

    /**
     * When mode === 'time' → value is duration in seconds.
     * When mode === 'reps' → value is number of reps.
     */
    mode: ExerciseMode;
    /**
     * Optional tempo / cadence for reps (ignored for time mode).
     */
    tempo?: string;
}

export interface WorkoutBlock {
    id: UUID;
    title?: string;
    sets: number;
    restBetweenSetsSec: number;
    restBetweenExercisesSec: number;
    exercises: WorkoutExercise[];
}

export interface Workout {
    id: UUID;
    name: string;
    blocks: WorkoutBlock[];
    updatedAtMs: number;
    isFavorite?: boolean;
}

export interface WorkoutListItem {
    id: UUID;
    name: string;
    updatedAtMs: number;
    isFavorite: boolean;
    blockCount: number;
    exerciseCount: number;
}
