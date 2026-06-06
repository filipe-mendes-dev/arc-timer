import {
    isAppErrorCode,
    type AppError,
    type AppErrorDefinition,
} from '@src/core/errors/appError';

export const gymErrors = {
    activeSessionExists: {
        code: 'ACTIVE_SESSION_EXISTS',
        message: 'gym.errors.activeSessionExists',
    },
    activeSessionNotFound: {
        code: 'ACTIVE_SESSION_NOT_FOUND',
        message: 'gym.errors.activeSessionNotFound',
    },
    activeSessionCannotBeDeleted: {
        code: 'ACTIVE_SESSION_CANNOT_BE_DELETED',
        message: 'gym.errors.activeSessionCannotBeDeleted',
    },
    exerciseDefinitionNotFound: {
        code: 'EXERCISE_DEFINITION_NOT_FOUND',
        message: 'gym.errors.exerciseDefinitionNotFound',
    },
    exerciseDefinitionNotGymAvailable: {
        code: 'EXERCISE_DEFINITION_NOT_GYM_AVAILABLE',
        message: 'gym.errors.exerciseDefinitionNotGymAvailable',
    },
    exerciseRecordNotFound: {
        code: 'EXERCISE_RECORD_NOT_FOUND',
        message: 'gym.errors.exerciseRecordNotFound',
    },
    exerciseRecordNotInActiveSession: {
        code: 'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION',
        message: 'gym.errors.exerciseRecordNotInActiveSession',
    },
    exerciseSetNotFound: {
        code: 'EXERCISE_SET_NOT_FOUND',
        message: 'gym.errors.exerciseSetNotFound',
    },
    gymPlanArchived: {
        code: 'GYM_PLAN_ARCHIVED',
        message: 'gym.errors.gymPlanArchived',
    },
    gymPlanNotFound: {
        code: 'GYM_PLAN_NOT_FOUND',
        message: 'gym.errors.gymPlanNotFound',
    },
    invalidGymPlan: {
        code: 'INVALID_GYM_PLAN',
        message: 'gym.errors.invalidGymPlan',
    },
    invalidGymExerciseRecordTimeRange: {
        code: 'INVALID_GYM_EXERCISE_RECORD',
        message: 'gym.errors.invalidGymExerciseRecordTimeRange',
    },
    invalidGymSessionTimeRange: {
        code: 'INVALID_GYM_SESSION',
        message: 'gym.errors.invalidGymSessionTimeRange',
    },
    invalidGymSet: {
        code: 'INVALID_GYM_SET',
        message: 'gym.errors.invalidGymSet',
    },
    sessionNotFound: {
        code: 'SESSION_NOT_FOUND',
        message: 'gym.errors.sessionNotFound',
    },
    sessionNotMutable: {
        code: 'SESSION_NOT_MUTABLE',
        message: 'gym.errors.sessionNotMutable',
    },
} as const satisfies Record<string, AppErrorDefinition<string>>;

export type GymErrorCode =
    (typeof gymErrors)[keyof typeof gymErrors]['code'];

export interface GymError extends AppError<GymErrorCode> {}

export interface GymErrorDefinition extends AppErrorDefinition<GymErrorCode> {}

const gymErrorCodes = Object.values(gymErrors).map(
    (definition) => definition.code,
);

export const createGymError = (definition: GymErrorDefinition): GymError =>
    Object.assign(new Error(definition.message), { code: definition.code });

export const isGymError = (e: unknown): e is GymError =>
    isAppErrorCode(e, gymErrorCodes);
