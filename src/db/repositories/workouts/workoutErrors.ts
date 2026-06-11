import {
    isAppErrorCode,
    type AppError,
    type AppErrorDefinition,
} from '@src/core/errors/appError';

export const workoutErrors = {
    unnamedExercises: {
        code: 'UNNAMED_EXERCISES',
        message: 'editWorkout.validation.unnamedExercises',
    },
} as const satisfies Record<string, AppErrorDefinition<string>>;

export type WorkoutErrorCode =
    (typeof workoutErrors)[keyof typeof workoutErrors]['code'];

export type WorkoutErrorMessage =
    (typeof workoutErrors)[keyof typeof workoutErrors]['message'];

export interface WorkoutError extends AppError<WorkoutErrorCode> {
    readonly message: WorkoutErrorMessage;
}

export interface WorkoutErrorDefinition
    extends AppErrorDefinition<WorkoutErrorCode> {
    readonly message: WorkoutErrorMessage;
}

const workoutErrorCodes = Object.values(workoutErrors).map(
    (definition) => definition.code,
);

export const createWorkoutError = (
    definition: WorkoutErrorDefinition,
): WorkoutError =>
    Object.assign(new Error(definition.message), {
        code: definition.code,
        message: definition.message,
    });

export const isWorkoutError = (e: unknown): e is WorkoutError =>
    isAppErrorCode(e, workoutErrorCodes);
