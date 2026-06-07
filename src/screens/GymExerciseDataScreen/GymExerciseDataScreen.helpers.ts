import type { TFunction } from 'i18next';

import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';

import type { SetDraft, TrackingFields } from './GymExerciseDataScreen.types';
import { defaultTrackingFields } from 'src/helpers/exerciseDefinition.helpers';
import {
    formatDistance,
    formatDurationMinutes,
    gramsToKg,
} from 'src/helpers/gymExerciseRecord.helpers';

export const inferTrackingFieldsFromSets = (
    sets: GymExerciseRecordSet[],
): TrackingFields => {
    if (sets.length === 0) {
        return defaultTrackingFields;
    }

    return {
        hasDistanceMeters: sets.some((set) => set.distanceMeters !== undefined),
        hasDurationSec: sets.some((set) => set.durationSec !== undefined),
        hasReps: sets.some((set) => set.reps !== undefined),
        hasRpe: sets.some((set) => set.rpeTenths !== undefined),
        hasWeight: sets.some((set) => set.weightGrams !== undefined),
    };
};

export const getPositiveValue = (value: number): number | undefined => {
    if (value <= 0) return undefined;

    return value;
};

export const draftFromSet = (set: GymExerciseRecordSet): SetDraft => ({
    distanceMeters: set.distanceMeters ?? 0,
    durationSec: set.durationSec ?? 0,
    id: set.id,
    reps: set.reps ?? 0,
    rpeTenths: set.rpeTenths ?? 0,
    weightKg: set.weightGrams ? set.weightGrams / 1000 : 0,
});

// TODO: Revisit exercise notes, RPE, and warmup once the gym flow proves a need.
export const getSetDetails = (
    set: GymExerciseRecordSet,
    t: TFunction,
): string => {
    const details: string[] = [];

    if (set.reps !== undefined) {
        details.push(t('gymExerciseData.setDetails.reps', { count: set.reps }));
    }

    if (set.weightGrams !== undefined) {
        details.push(
            t('gymExerciseData.setDetails.weight', {
                value: gramsToKg(set.weightGrams),
            }),
        );
    }

    if (set.durationSec !== undefined) {
        details.push(
            t('gymExerciseData.setDetails.duration', {
                value: formatDurationMinutes(set.durationSec),
            }),
        );
    }

    if (set.distanceMeters !== undefined) {
        details.push(
            t('gymExerciseData.setDetails.distance', {
                value: formatDistance(set.distanceMeters),
            }),
        );
    }

    if (set.rpeTenths !== undefined) {
        details.push(
            t('gymExerciseData.setDetails.rpe', {
                value: set.rpeTenths / 10,
            }),
        );
    }

    if (details.length === 0) {
        return t('gymExerciseData.setDetails.empty');
    }

    return details.join(' · ');
};
