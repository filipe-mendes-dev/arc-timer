import {
    isAppErrorCode,
    type AppError,
    type AppErrorDefinition,
} from '@src/core/errors/appError';

export const exerciseDefinitionErrors = {
    deleteReferenced: {
        code: 'DELETE_REFERENCED',
        message: 'exerciseDefinitions.validation.deleteReferenced',
    },
    deleteSystemForbidden: {
        code: 'DELETE_SYSTEM_FORBIDDEN',
        message: 'exerciseDefinitions.validation.deleteSystemForbidden',
    },
    duplicateName: {
        code: 'DUPLICATE_NAME',
        message: 'exerciseDefinitions.validation.duplicateName',
    },
    gymOnlyRestricted: {
        code: 'GYM_ONLY_RESTRICTED',
        message: 'exerciseDefinitions.validation.gymOnlyRestricted',
    },
    workoutOnlyRestricted: {
        code: 'WORKOUT_ONLY_RESTRICTED',
        message: 'exerciseDefinitions.validation.workoutOnlyRestricted',
    },
    mergeGymOnlyConflict: {
        code: 'MERGE_GYM_ONLY_CONFLICT',
        message: 'exerciseDefinitions.validation.mergeGymOnlyConflict',
    },
    mergeWorkoutOnlyConflict: {
        code: 'MERGE_WORKOUT_ONLY_CONFLICT',
        message: 'exerciseDefinitions.validation.mergeWorkoutOnlyConflict',
    },
} as const satisfies Record<string, AppErrorDefinition<string>>;

export type ExerciseDefinitionErrorCode =
    (typeof exerciseDefinitionErrors)[keyof typeof exerciseDefinitionErrors]['code'];

export type ExerciseDefinitionErrorMessage =
    (typeof exerciseDefinitionErrors)[keyof typeof exerciseDefinitionErrors]['message'];

export interface ExerciseDefinitionError
    extends AppError<ExerciseDefinitionErrorCode> {
    readonly message: ExerciseDefinitionErrorMessage;
}

export interface ExerciseDefinitionErrorDefinition
    extends AppErrorDefinition<ExerciseDefinitionErrorCode> {
    readonly message: ExerciseDefinitionErrorMessage;
}

const exerciseDefinitionErrorCodes = Object.values(
    exerciseDefinitionErrors,
).map((definition) => definition.code);

export const createExerciseDefinitionError = (
    definition: ExerciseDefinitionErrorDefinition,
    message: ExerciseDefinitionErrorMessage = definition.message,
): ExerciseDefinitionError =>
    Object.assign(new Error(message), { code: definition.code, message });

export const isExerciseDefinitionError = (
    e: unknown,
): e is ExerciseDefinitionError =>
    isAppErrorCode(e, exerciseDefinitionErrorCodes);
