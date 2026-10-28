import type {
    ExerciseDefinitionTargetSetData,
    ExerciseTrackingField,
    ExerciseTrackingPreset,
} from '../entities/exerciseDefinition.interfaces';

export const DEFAULT_REPS = 12;
export const DEFAULT_WEIGHT_GRAMS = 10_000;
export const DEFAULT_DURATION_SEC = 300;
export const DEFAULT_DISTANCE_METERS = 1_000;
export const DEFAULT_RPE_TENTHS = 70;

export const exerciseTrackingPresets: readonly ExerciseTrackingPreset[] = [
    {
        id: 'strength',
        fields: ['reps', 'weight'],
        defaultTargetSet: {
            reps: DEFAULT_REPS,
            weightGrams: DEFAULT_WEIGHT_GRAMS,
        },
    },
    {
        id: 'cardio',
        fields: ['distance', 'duration'],
        defaultTargetSet: {
            distanceMeters: DEFAULT_DISTANCE_METERS,
            durationSec: DEFAULT_DURATION_SEC,
        },
    },
    {
        id: 'timed',
        fields: ['duration'],
        defaultTargetSet: { durationSec: DEFAULT_DURATION_SEC },
    },
    {
        id: 'bodyweight',
        fields: ['reps'],
        defaultTargetSet: { reps: DEFAULT_REPS },
    },
];

export const createStarterTargetSet = (
    fields: readonly ExerciseTrackingField[],
    defaults?: ExerciseDefinitionTargetSetData,
): ExerciseDefinitionTargetSetData => {
    const targetSet: ExerciseDefinitionTargetSetData = {};

    fields.forEach((field) => {
        switch (field) {
            case 'reps':
                targetSet.reps = defaults?.reps ?? DEFAULT_REPS;
                break;
            case 'weight':
                targetSet.weightGrams =
                    defaults?.weightGrams ?? DEFAULT_WEIGHT_GRAMS;
                break;
            case 'duration':
                targetSet.durationSec =
                    defaults?.durationSec ?? DEFAULT_DURATION_SEC;
                break;
            case 'distance':
                targetSet.distanceMeters =
                    defaults?.distanceMeters ?? DEFAULT_DISTANCE_METERS;
                break;
            case 'rpe':
                targetSet.rpeTenths =
                    defaults?.rpeTenths ?? DEFAULT_RPE_TENTHS;
                break;
        }
    });

    return targetSet;
};
