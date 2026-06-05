import type { TFunction } from 'i18next';
import type { RefObject } from 'react';

import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import type {
    GymPlan,
    GymPlanExercise,
    GymPlanExerciseTargetSet,
} from '@src/core/entities/gym.interfaces';
import {
    createGymPlanTargetSet,
    getDefaultGymPlanTargetWeightKg,
    withGymPlanExerciseTargetSets,
} from '@src/core/gyms/gymPlanTargetSets';
import { uid } from '@src/core/id';

import {
    DEFAULT_REPS,
    draftFromSet,
    formatDistance,
    formatDurationMinutes,
    formatWeight,
    getPositiveValue,
    getWeightGrams,
} from '../GymExerciseDataScreen/GymExerciseDataScreen.helpers';
import type {
    SetDraft,
    TrackingFields,
} from '../GymExerciseDataScreen/GymExerciseDataScreen.types';

export interface ExerciseLookup {
    exercise: GymPlanExercise;
    isCreating: boolean;
    sectionId: string;
}

export interface TopBarActionConfig {
    color?: string;
    disabled?: boolean;
    icon: 'close' | 'trash';
    onPress: () => void;
}

export interface TopBarConfig {
    leftAction?: TopBarActionConfig;
    rightAction?: TopBarActionConfig;
    title: string;
}

export interface TopBarOptionsActions {
    enterSelectMode: () => void;
    openTrackingFieldsModal: () => void;
    selectAll: (ids: string[]) => void;
}

export const MAX_SUGGESTION_COUNT = 6;

export const initialTrackingFields: TrackingFields = {
    hasDistanceMeters: false,
    hasDurationSec: false,
    hasReps: true,
    hasWeight: true,
};

export const trackingFieldsModalCopy = {
    description: 'gymExerciseData.defaults.description',
    removeDataAndSave: 'gymExerciseData.defaults.removeDataAndSave',
    removeDataWarning: 'gymExerciseData.defaults.removeDataWarning',
    title: 'gymExerciseData.defaults.title',
};

export const getSuggestionQuery = (
    hasEnteredNameInput: boolean,
    trimmedNameInput: string,
): string | undefined => {
    if (!hasEnteredNameInput || trimmedNameInput.length === 0) {
        return undefined;
    }

    return trimmedNameInput;
};

export const getExerciseTitle = (
    displayExerciseName: string,
    t: TFunction,
): string => {
    const trimmedName = displayExerciseName.trim();
    if (trimmedName.length > 0) return displayExerciseName;

    return t('gymPlanExerciseEdit.newExerciseTitle');
};

export const inferTrackingFieldsFromTargetSets = (
    sets: readonly GymPlanExerciseTargetSet[],
): TrackingFields => {
    if (sets.length === 0) return initialTrackingFields;

    const trackingFields = {
        hasDistanceMeters: sets.some(
            (set) => set.distanceMeters !== undefined,
        ),
        hasDurationSec: sets.some((set) => set.durationSec !== undefined),
        hasReps: sets.some((set) => set.reps !== undefined),
        hasWeight: sets.some((set) => set.weightGrams !== undefined),
    };

    if (
        !trackingFields.hasDistanceMeters &&
        !trackingFields.hasDurationSec &&
        !trackingFields.hasReps &&
        !trackingFields.hasWeight
    ) {
        return initialTrackingFields;
    }

    return trackingFields;
};

export const getRemovedTrackingFields = (
    current: TrackingFields,
    draft: TrackingFields,
): (keyof TrackingFields)[] => {
    const removedFields: (keyof TrackingFields)[] = [];

    if (current.hasReps && !draft.hasReps) {
        removedFields.push('hasReps');
    }
    if (current.hasWeight && !draft.hasWeight) {
        removedFields.push('hasWeight');
    }
    if (current.hasDurationSec && !draft.hasDurationSec) {
        removedFields.push('hasDurationSec');
    }
    if (current.hasDistanceMeters && !draft.hasDistanceMeters) {
        removedFields.push('hasDistanceMeters');
    }

    return removedFields;
};

export const setHasTrackingFieldData = (
    set: GymPlanExerciseTargetSet,
    field: keyof TrackingFields,
): boolean => {
    if (field === 'hasReps') return set.reps !== undefined;
    if (field === 'hasWeight') return set.weightGrams !== undefined;
    if (field === 'hasDurationSec') return set.durationSec !== undefined;

    return set.distanceMeters !== undefined;
};

export const getTargetSetDetails = (
    set: GymPlanExerciseTargetSet,
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

    if (details.length === 0) return t('gymExerciseData.setDetails.empty');

    return details.join(' · ');
};

export const targetSetFromDraft = (
    draft: SetDraft,
    trackingFields: TrackingFields,
): GymPlanExerciseTargetSet => {
    const nowMs = Date.now();
    const targetSet: GymPlanExerciseTargetSet = {
        id: draft.id,
        setIndex: 0,
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
    };

    if (trackingFields.hasReps) {
        targetSet.reps = getPositiveValue(draft.reps);
    }
    if (trackingFields.hasWeight) {
        targetSet.weightGrams = getWeightGrams(draft.weightKg);
    }
    if (trackingFields.hasDurationSec) {
        targetSet.durationSec = getPositiveValue(draft.durationSec);
    }
    if (trackingFields.hasDistanceMeters) {
        targetSet.distanceMeters = getPositiveValue(draft.distanceMeters);
    }

    return targetSet;
};

export const draftFromTargetSet = (set: GymPlanExerciseTargetSet): SetDraft =>
    draftFromSet({
        ...set,
        isWarmup: false,
    });

export const getSelectedExerciseDefinitionId = (
    exercise: GymPlanExercise,
): string | undefined => {
    if (exercise.exerciseDefinitionId.trim().length > 0) {
        return exercise.exerciseDefinitionId;
    }

    return undefined;
};

export const createNextTargetSet = (
    targetSets: readonly GymPlanExerciseTargetSet[],
    trackingFields: TrackingFields,
): GymPlanExerciseTargetSet => {
    const previousSet = targetSets.at(-1);
    const previousWeightKg = getPreviousTargetWeightKg(previousSet);
    const nextSet: GymPlanExerciseTargetSet = {
        ...createGymPlanTargetSet(targetSets.length),
    };

    if (trackingFields.hasReps) {
        nextSet.reps = previousSet?.reps ?? DEFAULT_REPS;
    }
    if (trackingFields.hasWeight) {
        nextSet.weightGrams = getWeightGrams(previousWeightKg);
    }
    if (trackingFields.hasDurationSec) {
        nextSet.durationSec = previousSet?.durationSec;
    }
    if (trackingFields.hasDistanceMeters) {
        nextSet.distanceMeters = previousSet?.distanceMeters;
    }

    return nextSet;
};

const getPreviousTargetWeightKg = (
    previousSet: GymPlanExerciseTargetSet | undefined,
): number => {
    if (previousSet?.weightGrams !== undefined) {
        return previousSet.weightGrams / 1000;
    }

    return getDefaultGymPlanTargetWeightKg();
};

export const removeTrackingFieldData = (
    targetSets: readonly GymPlanExerciseTargetSet[],
    removedFields: readonly (keyof TrackingFields)[],
): GymPlanExerciseTargetSet[] =>
    targetSets.map((set) => {
        const nextSet = { ...set };

        if (removedFields.includes('hasDistanceMeters')) {
            nextSet.distanceMeters = undefined;
        }
        if (removedFields.includes('hasDurationSec')) {
            nextSet.durationSec = undefined;
        }
        if (removedFields.includes('hasReps')) {
            nextSet.reps = undefined;
        }
        if (removedFields.includes('hasWeight')) {
            nextSet.weightGrams = undefined;
        }

        return nextSet;
    });

export const getExerciseLookup = (
    draft: GymPlan | null,
    sectionId: string | undefined,
    exerciseId: string | undefined,
    createExerciseDraftRef: RefObject<GymPlanExercise | null>,
): ExerciseLookup | null => {
    if (!draft || !sectionId) return null;

    const section = draft.sections.find((item) => item.id === sectionId);
    if (!section) return null;

    if (!exerciseId) {
        if (!createExerciseDraftRef.current) {
            const nowMs = Date.now();
            createExerciseDraftRef.current = withGymPlanExerciseTargetSets(
                {
                    id: uid(),
                    exerciseDefinitionId: '',
                    sortIndex: section.exercises.length,
                    createdAtMs: nowMs,
                    updatedAtMs: nowMs,
                },
                [createGymPlanTargetSet(0)],
            );
        }

        return {
            exercise: createExerciseDraftRef.current,
            isCreating: true,
            sectionId: section.id,
        };
    }

    const exercise = section.exercises.find((item) => item.id === exerciseId);
    if (!exercise) return null;

    return { exercise, isCreating: false, sectionId: section.id };
};

export const getExerciseDefinitionName = (
    exerciseDefinitionId: string | undefined,
    definitions: readonly { id: string; name: string }[],
): string | undefined =>
    definitions.find((definition) => definition.id === exerciseDefinitionId)
        ?.name;

export const buildCommittedDraft = (
    draft: GymPlan | null,
    lookup: ExerciseLookup | null,
    exerciseDefinitionId: string,
    targetSets: readonly GymPlanExerciseTargetSet[],
): GymPlan | null => {
    if (!draft || !lookup) return null;

    return {
        ...draft,
        sections: draft.sections.map((section) => {
            if (section.id !== lookup.sectionId) return section;

            const nextExercise = withGymPlanExerciseTargetSets(
                {
                    ...lookup.exercise,
                    exerciseDefinitionId,
                    name: undefined,
                },
                targetSets,
            );

            if (lookup.isCreating) {
                return {
                    ...section,
                    exercises: [...section.exercises, nextExercise],
                };
            }

            return {
                ...section,
                exercises: section.exercises.map((exercise) => {
                    if (exercise.id !== lookup.exercise.id) return exercise;

                    return nextExercise;
                }),
            };
        }),
    };
};

export const getTopBarConfig = (
    title: string,
    isSelectMode: boolean,
    selectedCount: number,
    hasSelection: boolean,
    colors: {
        error: string;
        secondary: string;
    },
    actions: {
        exitSelectMode: () => void;
        requestSelectedDelete: () => void;
    },
    t: TFunction,
): TopBarConfig => {
    if (!isSelectMode) return { title };

    return {
        title: t('common.selectMode.countSelected', {
            count: selectedCount,
        }),
        leftAction: { icon: 'close', onPress: actions.exitSelectMode },
        rightAction: {
            icon: 'trash',
            color: hasSelection ? colors.error : colors.secondary,
            disabled: !hasSelection,
            onPress: actions.requestSelectedDelete,
        },
    };
};

export const getTopBarOptions = (
    isSelectMode: boolean,
    targetSets: readonly GymPlanExerciseTargetSet[],
    actions: TopBarOptionsActions,
    t: TFunction,
): readonly TopBarOption[] => {
    if (isSelectMode) {
        return [
            {
                id: 'selectAll',
                label: t('common.selectMode.selectAll'),
                icon: 'checkmark',
                onPress: () =>
                    actions.selectAll(targetSets.map((set) => set.id)),
            },
        ];
    }

    return [
        {
            id: 'select',
            label: t('common.selectMode.enter'),
            icon: 'checkmark',
            disabled: targetSets.length === 0,
            onPress: actions.enterSelectMode,
        },
        {
            id: 'trackingFields',
            label: t('gymExerciseData.actions.trackingFields'),
            icon: 'edit',
            onPress: actions.openTrackingFieldsModal,
        },
    ];
};
