import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import { getPlannedSetCount } from '@src/screens/GymPlanEditScreen/components/GymPlanSectionItem/GymPlanSectionItem.helpers';

export const getExerciseCount = (gymPlan: GymPlan): number =>
    gymPlan.sections.reduce(
        (total, section) => total + section.exercises.length,
        0,
    );

export const getTargetSetCount = (gymPlan: GymPlan): number =>
    gymPlan.sections.reduce(
        (total, section) => total + getPlannedSetCount(section),
        0,
    );
