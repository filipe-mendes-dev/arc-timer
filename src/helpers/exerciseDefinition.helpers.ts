import type {
    ExerciseDefinition,
    ExerciseDefinitionTargetSetData,
} from 'src/core/entities/exerciseDefinition.interfaces';
import { DEFAULT_WEIGHT_GRAMS } from 'src/core/exercises/exerciseTrackingPresets';
import {
    trackingFieldValueFromFields,
    type GymExerciseTrackingFieldsValue,
} from 'src/core/entities/exerciseTrackingFields';

export {
    DEFAULT_DISTANCE_METERS,
    DEFAULT_DURATION_SEC,
    DEFAULT_REPS,
    DEFAULT_RPE_TENTHS,
} from 'src/core/exercises/exerciseTrackingPresets';
export const DEFAULT_WEIGHT_KG = DEFAULT_WEIGHT_GRAMS / 1000;

export const defaultTrackingFields: GymExerciseTrackingFieldsValue = {
    hasDistanceMeters: false,
    hasDurationSec: false,
    hasReps: true,
    hasRpe: false,
    hasWeight: true,
};

export const trackingFieldsFromDefinition = (
    definition: ExerciseDefinition,
): GymExerciseTrackingFieldsValue => {
    const fields = definition.data?.defaultTrackingFields ?? [];

    return trackingFieldValueFromFields(fields);
};

export const createTargetSetFromDefinition = <
    TargetSet extends ExerciseDefinitionTargetSetData,
>(
    definition: ExerciseDefinition,
    fallbackTargetSet: TargetSet,
): TargetSet => {
    const defaultTargetSet = definition.data?.defaultTargetSet;

    if (!defaultTargetSet) return fallbackTargetSet;

    return {
        ...fallbackTargetSet,
        ...defaultTargetSet,
    };
};
