import type { TFunction } from 'i18next';

import type {
    GymPlanExercise,
    GymPlanSection,
} from '@src/core/entities/gym.interfaces';
import { getGymPlanExerciseTargetSets } from '@src/core/gyms/gymPlanTargetSets';

export type GymPlanSectionItemCopyScope = 'builder' | 'details';

export const getDisplayName = (
    name: string | undefined,
    fallbackName: string,
): string => {
    if (name && name.length > 0) return name;

    return fallbackName;
};

export const getPlannedSetCount = (section: GymPlanSection): number =>
    section.exercises.reduce(
        (total, exercise) =>
            total + getGymPlanExerciseTargetSets(exercise).length,
        0,
    );

export const getExercisePlannedSetCount = (
    exercise: GymPlanExercise,
): number => getGymPlanExerciseTargetSets(exercise).length;

export const getSectionFallbackLabel = (
    index: number,
    scope: GymPlanSectionItemCopyScope,
    t: TFunction,
): string => {
    if (scope === 'details') {
        return t('gymPlanDetails.sectionFallback', { index: index + 1 });
    }

    return t('gymPlanBuilder.sectionFallback', { index: index + 1 });
};

export const getExerciseFallbackLabel = (
    index: number,
    scope: GymPlanSectionItemCopyScope,
    t: TFunction,
): string => {
    if (scope === 'details') {
        return t('gymPlanDetails.exerciseFallback');
    }

    return t('gymPlanBuilder.exerciseFallback', { index: index + 1 });
};

export const getExerciseCountLabel = (
    count: number,
    scope: GymPlanSectionItemCopyScope,
    t: TFunction,
): string => {
    if (scope === 'details') {
        return t('gymPlanDetails.exerciseCount', { count });
    }

    return t('gymPlanBuilder.exerciseCount', { count });
};

export const getPlannedSetCountLabel = (
    count: number,
    scope: GymPlanSectionItemCopyScope,
    t: TFunction,
): string => {
    if (scope === 'details') {
        return t('gymPlanDetails.targets.sets', { count });
    }

    return t('gymPlanBuilder.plannedSetCount', { count });
};
