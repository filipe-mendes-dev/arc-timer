import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

import type {
    ExerciseDefinition,
    ExerciseDefinitionTargetSetData,
    ExerciseTrackingField,
} from '@src/core/entities/exerciseDefinition.interfaces';
import type { TrackingFieldsModalCopy } from '@src/components/gym/TrackingFieldsModal';
import {
    fieldsFromTrackingFieldValue,
    trackingFieldValueFromFields,
    type ExerciseDefinitionTrackingFieldsValue,
} from '@src/core/entities/exerciseTrackingFields';
import type { GymSessionListItem } from '@src/core/entities/gymSession.interfaces';
import type { I18nKey } from '@src/i18n/i18nKey';

export interface ExerciseDefinitionTrackingFields extends ExerciseDefinitionTrackingFieldsValue {}

export interface ExerciseDefinitionMetricItem {
    field: ExerciseTrackingField;
    labelKey: I18nKey;
    value: string;
}

export interface ExerciseDefinitionStatItem {
    id: string;
    labelKey: I18nKey;
    value: string;
}

export interface ExerciseDefinitionTargetValue extends ExerciseDefinitionTargetSetData {
    field: ExerciseTrackingField;
}

export const sourceLabelKeyBySource = {
    system: 'exerciseDefinitions.source.system',
    user: 'exerciseDefinitions.source.user',
} as const;

export const availabilityLabelKeyByAvailability = {
    both: 'exerciseDefinitions.availability.both',
    gym: 'exerciseDefinitions.availability.gym',
    workout: 'exerciseDefinitions.availability.workout',
} as const;

export const trackingFieldsModalCopy: TrackingFieldsModalCopy = {
    description: 'exerciseDefinitions.trackingModal.subtitle',
    removeDataAndSave: 'exerciseDefinitions.trackingModal.removeDefaultAndSave',
    removeDataWarning: 'exerciseDefinitions.trackingModal.removeDefaultWarning',
    title: 'exerciseDefinitions.trackingModal.title',
};

export const numberToDraft = (value?: number): string =>
    value === undefined ? '' : String(value);

export const weightToDraft = (weightGrams?: number): string => {
    if (weightGrams === undefined) return '';

    return String(weightGrams / 1000);
};

export const rpeToDraft = (rpeTenths?: number): string => {
    if (rpeTenths === undefined) return '';

    return String(rpeTenths / 10);
};

export const draftToInteger = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const numericValue = Number(trimmed);
    if (!Number.isFinite(numericValue)) return undefined;

    return Math.round(numericValue);
};

export const draftToWeightGrams = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const numericValue = Number(trimmed);
    if (!Number.isFinite(numericValue)) return undefined;

    return Math.round(numericValue * 1000);
};

export const draftToRpeTenths = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const numericValue = Number(trimmed);
    if (!Number.isFinite(numericValue)) return undefined;

    return Math.round(numericValue * 10);
};

export const formatRpe = (rpeTenths?: number): string | undefined => {
    if (rpeTenths === undefined) return undefined;

    return `${rpeTenths / 10}`;
};

export const formatMetric = (value?: string | number): string | undefined => {
    if (value === undefined) return undefined;

    return String(value);
};

export const formatSessionDate = (
    startedAtMs: number,
    locale: string,
): string =>
    new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(startedAtMs));

export const getSessionTitle = (
    session: GymSessionListItem,
    fallbackTitle: string,
): string => session.sourceGymPlanName ?? fallbackTitle;

export const getSourceIconName = (
    source: ExerciseDefinition['source'],
): ComponentProps<typeof Ionicons>['name'] => {
    if (source === 'system') return 'sparkles-outline';

    return 'person-outline';
};

export const trackingFieldsFromDefinition = (
    definition: ExerciseDefinition,
): ExerciseDefinitionTrackingFields =>
    trackingFieldValueFromFields(definition.data?.defaultTrackingFields ?? []);

export const fieldsFromTrackingValue = (
    trackingValue: ExerciseDefinitionTrackingFields,
): ExerciseTrackingField[] => fieldsFromTrackingFieldValue(trackingValue);

export const targetSetFromDefinition = (
    definition: ExerciseDefinition,
    enabledFields: readonly ExerciseTrackingField[],
): ExerciseDefinitionTargetSetData => {
    const targetSet: ExerciseDefinitionTargetSetData = {};
    const currentTargetSet = definition.data?.defaultTargetSet;

    if (enabledFields.includes('reps')) {
        targetSet.reps = currentTargetSet?.reps;
    }

    if (enabledFields.includes('weight')) {
        targetSet.weightGrams = currentTargetSet?.weightGrams;
    }

    if (enabledFields.includes('duration')) {
        targetSet.durationSec = currentTargetSet?.durationSec;
    }

    if (enabledFields.includes('distance')) {
        targetSet.distanceMeters = currentTargetSet?.distanceMeters;
    }

    if (enabledFields.includes('rpe')) {
        targetSet.rpeTenths = currentTargetSet?.rpeTenths;
    }

    return targetSet;
};

export const draftFromTargetField = (
    definition: ExerciseDefinition,
    field: ExerciseTrackingField,
): string => {
    const targetSet = definition.data?.defaultTargetSet;

    switch (field) {
        case 'reps':
            return numberToDraft(targetSet?.reps);
        case 'weight':
            return weightToDraft(targetSet?.weightGrams);
        case 'duration':
            return numberToDraft(targetSet?.durationSec);
        case 'distance':
            return numberToDraft(targetSet?.distanceMeters);
        case 'rpe':
            return rpeToDraft(targetSet?.rpeTenths);
        default:
            return '';
    }
};

export const applyDraftToTargetSet = (
    targetSet: ExerciseDefinitionTargetSetData,
    field: ExerciseTrackingField,
    draft: string,
): ExerciseDefinitionTargetSetData => {
    switch (field) {
        case 'reps':
            return { ...targetSet, reps: draftToInteger(draft) };
        case 'weight':
            return { ...targetSet, weightGrams: draftToWeightGrams(draft) };
        case 'duration':
            return { ...targetSet, durationSec: draftToInteger(draft) };
        case 'distance':
            return { ...targetSet, distanceMeters: draftToInteger(draft) };
        case 'rpe':
            return { ...targetSet, rpeTenths: draftToRpeTenths(draft) };
        default:
            return targetSet;
    }
};

export const applyValueToTargetSet = (
    targetSet: ExerciseDefinitionTargetSetData,
    value: ExerciseDefinitionTargetValue,
): ExerciseDefinitionTargetSetData => {
    switch (value.field) {
        case 'reps':
            return { ...targetSet, reps: value.reps };
        case 'weight':
            return { ...targetSet, weightGrams: value.weightGrams };
        case 'duration':
            return { ...targetSet, durationSec: value.durationSec };
        case 'distance':
            return { ...targetSet, distanceMeters: value.distanceMeters };
        case 'rpe':
            return { ...targetSet, rpeTenths: value.rpeTenths };
        default:
            return targetSet;
    }
};
