import type {
    ExerciseDefinition,
    ExerciseDefinitionTargetSetData,
} from 'src/core/entities/exerciseDefinition.interfaces';
import {
    trackingFieldValueFromFields,
    type GymExerciseTrackingFieldsValue,
} from 'src/core/entities/exerciseTrackingFields';

export const DEFAULT_REPS = 12;
export const DEFAULT_WEIGHT_KG = 10;

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

    if (fields.length === 0) return defaultTrackingFields;

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
        distanceMeters: defaultTargetSet.distanceMeters,
        durationSec: defaultTargetSet.durationSec,
        reps: defaultTargetSet.reps,
        rpeTenths: defaultTargetSet.rpeTenths,
        weightGrams: defaultTargetSet.weightGrams,
    };
};
