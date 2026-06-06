import type {
    GymPlan,
    GymPlanExercise,
    GymPlanExerciseTargetSet,
    GymPlanSection,
} from '@src/core/entities/gymPlan.interfaces';
import { uid } from '@src/core/id';

import {
    createGymPlanTargetSet,
    getGymPlanExerciseTargetSets,
    withGymPlanExerciseTargetSets,
} from './gymPlanTargetSets';

const DEFAULT_SECTION_EXERCISE_COUNT = 1;

export const isPlaceholderGymPlanExercise = (
    exercise: GymPlanExercise,
): boolean => exercise.exerciseDefinitionId.trim().length === 0;

export const stripPlaceholderGymPlanExercises = (
    gymPlan: GymPlan,
): GymPlan => ({
    ...gymPlan,
    sections: gymPlan.sections.map((section) => ({
        ...section,
        exercises: section.exercises.filter(
            (exercise) => !isPlaceholderGymPlanExercise(exercise),
        ),
    })),
});

export const createGymPlanPlaceholderExercise = (
    index: number,
): GymPlanExercise => {
    const nowMs = Date.now();
    const exercise: GymPlanExercise = {
        id: uid(),
        exerciseDefinitionId: '',
        sortIndex: index - 1,
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
    };

    return withGymPlanExerciseTargetSets(exercise, [createGymPlanTargetSet(0)]);
};

export const createEmptyGymPlanSection = (): GymPlanSection => {
    const nowMs = Date.now();

    return {
        id: uid(),
        title: '',
        sortIndex: 0,
        exercises: [],
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
    };
};

export const createGymPlanSectionWithPlaceholders = (
    exerciseCount = DEFAULT_SECTION_EXERCISE_COUNT,
): GymPlanSection => ({
    ...createEmptyGymPlanSection(),
    exercises: Array.from({ length: exerciseCount }).map((_item, index) =>
        createGymPlanPlaceholderExercise(index + 1),
    ),
});

export const createEmptyGymPlanDraft = (): GymPlan => {
    const nowMs = Date.now();

    return {
        id: uid(),
        name: '',
        description: undefined,
        sections: [],
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
        isFavorite: false,
        status: 'draft',
        draftTargetGymPlanId: undefined,
    };
};

const cloneTargetSetForDraft = (
    targetSet: GymPlanExerciseTargetSet,
    setIndex: number,
    nowMs: number,
): GymPlanExerciseTargetSet => ({
    ...targetSet,
    id: uid(),
    setIndex,
    createdAtMs: nowMs,
    updatedAtMs: nowMs,
});

const cloneExerciseForDraft = (
    exercise: GymPlanExercise,
    exerciseIndex: number,
    nowMs: number,
): GymPlanExercise => {
    const targetSets = getGymPlanExerciseTargetSets(exercise).map(
        (targetSet, setIndex) =>
            cloneTargetSetForDraft(targetSet, setIndex, nowMs),
    );
    const nextExercise: GymPlanExercise = {
        ...exercise,
        id: uid(),
        sortIndex: exerciseIndex,
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
    };

    return withGymPlanExerciseTargetSets(nextExercise, targetSets);
};

const cloneSectionForDraft = (
    section: GymPlanSection,
    sectionIndex: number,
    nowMs: number,
): GymPlanSection => ({
    ...section,
    id: uid(),
    sortIndex: sectionIndex,
    exercises: section.exercises.map((exercise, exerciseIndex) =>
        cloneExerciseForDraft(exercise, exerciseIndex, nowMs),
    ),
    createdAtMs: nowMs,
    updatedAtMs: nowMs,
});

export const cloneGymPlanAsDraft = (gymPlan: GymPlan): GymPlan => {
    const nowMs = Date.now();

    return {
        ...gymPlan,
        id: uid(),
        sections: gymPlan.sections.map((section, sectionIndex) =>
            cloneSectionForDraft(section, sectionIndex, nowMs),
        ),
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
        status: 'draft',
        draftTargetGymPlanId: gymPlan.id,
    };
};

export const cloneImportedGymPlanAsDraft = (gymPlan: GymPlan): GymPlan => ({
    ...cloneGymPlanAsDraft(gymPlan),
    isFavorite: false,
    draftTargetGymPlanId: undefined,
});
