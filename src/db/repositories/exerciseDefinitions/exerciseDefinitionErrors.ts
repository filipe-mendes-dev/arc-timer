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

export interface ExerciseDefinitionError
    extends AppError<ExerciseDefinitionErrorCode> {}

export interface ExerciseDefinitionErrorDefinition
    extends AppErrorDefinition<ExerciseDefinitionErrorCode> {}

const exerciseDefinitionErrorCodes = Object.values(
    exerciseDefinitionErrors,
).map((definition) => definition.code);

export const createExerciseDefinitionError = (
    definition: ExerciseDefinitionErrorDefinition,
    message: string = definition.message,
): ExerciseDefinitionError =>
    Object.assign(new Error(message), { code: definition.code });

export const isExerciseDefinitionError = (
    e: unknown,
): e is ExerciseDefinitionError =>
    isAppErrorCode(e, exerciseDefinitionErrorCodes);
