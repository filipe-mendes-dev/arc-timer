import type {
    GymPlanExercise,
    GymPlanExerciseTargetSet,
} from '@src/core/entities/gymPlan.interfaces';
import { uid } from '@src/core/id';

const DEFAULT_TARGET_WEIGHT_KG = 5;

export const getDefaultGymPlanTargetWeightKg = (): number =>
    DEFAULT_TARGET_WEIGHT_KG;

export const createGymPlanTargetSet = (
    setIndex: number,
): GymPlanExerciseTargetSet => {
    const nowMs = Date.now();

    return {
        id: uid(),
        setIndex,
        reps: 10,
        weightGrams: DEFAULT_TARGET_WEIGHT_KG * 1000,
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
    };
};

export const getGymPlanExerciseTargetSets = (
    exercise: GymPlanExercise,
): GymPlanExerciseTargetSet[] => {
    if (!exercise.targetSetDrafts) return [];

    return exercise.targetSetDrafts.map((set, setIndex) => ({
        ...set,
        setIndex,
    }));
};

export const withGymPlanExerciseTargetSets = (
    exercise: GymPlanExercise,
    targetSets: readonly GymPlanExerciseTargetSet[],
): GymPlanExercise => {
    const normalizedSets = targetSets.map((set, setIndex) => ({
        ...set,
        setIndex,
    }));

    return {
        ...exercise,
        targetSetDrafts: normalizedSets,
    };
};
