import type { TFunction } from 'i18next';

import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';

import type { SetDraft, TrackingFields } from './GymExerciseDataScreen.types';

export const DEFAULT_REPS = 12;
export const DEFAULT_WEIGHT_KG = 10;

export const initialTrackingFields: TrackingFields = {
    hasDistanceMeters: false,
    hasDurationSec: false,
    hasReps: true,
    hasRpe: false,
    hasWeight: true,
};

export const inferTrackingFieldsFromSets = (
    sets: GymExerciseRecordSet[],
): TrackingFields => {
    if (sets.length === 0) {
        return initialTrackingFields;
    }

    const trackingFields = {
        hasDistanceMeters: sets.some(
            (set) => set.distanceMeters !== undefined,
        ),
        hasDurationSec: sets.some((set) => set.durationSec !== undefined),
        hasReps: sets.some((set) => set.reps !== undefined),
        hasRpe: sets.some((set) => set.rpeTenths !== undefined),
        hasWeight: sets.some((set) => set.weightGrams !== undefined),
    };

    if (
        !trackingFields.hasDistanceMeters &&
        !trackingFields.hasDurationSec &&
        !trackingFields.hasReps &&
        !trackingFields.hasRpe &&
        !trackingFields.hasWeight
    ) {
        return initialTrackingFields;
    }

    return trackingFields;
};

export const formatWeight = (weightGrams: number): string => {
    const weightKg = weightGrams / 1000;
    return Number.isInteger(weightKg) ? `${weightKg}` : weightKg.toFixed(1);
};

export const formatDistance = (distanceMeters: number): string => {
    const distanceKm = distanceMeters / 1000;

    if (Number.isInteger(distanceKm)) {
        return `${distanceKm}`;
    }

    return distanceKm.toFixed(2);
};

export const formatDurationMinutes = (durationSec: number): string => {
    const durationMin = Math.round(durationSec / 60);

    if (durationSec > 0 && durationMin < 1) {
        return '1 min';
    }

    if (durationMin < 60) {
        return `${durationMin} min`;
    }

    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    if (minutes === 0) {
        return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
};

export const getWeightGrams = (weightKg: number): number | undefined => {
    if (weightKg <= 0) return undefined;

    return Math.round(weightKg * 1000);
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
                value: formatWeight(set.weightGrams),
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
