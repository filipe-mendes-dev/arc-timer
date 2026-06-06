import type { UUID } from './common.interfaces';
import type { Workout } from './workout.interfaces';

export interface WorkoutSessionStats {
    completedSets: number;
    completedExercises: number;

    totalWorkSec: number;
    totalRestSec: number;
    totalPrepSec?: number;

    totalPausedSec?: number;
    totalBlockPauseSec?: number;

    completedSetsByBlock?: number[];
    completedExercisesByBlock?: number[];
    workSecByBlock?: number[];
    restSecByBlock?: number[];
    prepSecByBlock?: number[];
}

export interface WorkoutSession {
    id: UUID;

    startedAtMs: number;
    endedAtMs: number;

    workoutSnapshot: Workout;
    activeWorkoutId?: UUID;
    workoutVersionId: UUID;

    totalDurationSec?: number;

    stats?: WorkoutSessionStats;
}

export interface WorkoutSessionListItem {
    id: UUID;
    startedAtMs: number;
    endedAtMs: number;
    workoutName: string;
    activeWorkoutId?: UUID;
    workoutVersionId: UUID;
    totalDurationSec?: number;
}
