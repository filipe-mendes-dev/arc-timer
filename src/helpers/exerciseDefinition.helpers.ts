import type { GymExerciseTrackingFieldsValue } from 'src/core/entities/exerciseTrackingFields';

export const DEFAULT_REPS = 12;
export const DEFAULT_WEIGHT_KG = 10;

export const defaultTrackingFields: GymExerciseTrackingFieldsValue = {
    hasDistanceMeters: false,
    hasDurationSec: false,
    hasReps: true,
    hasRpe: false,
    hasWeight: true,
};
