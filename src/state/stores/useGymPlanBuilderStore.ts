import { create } from 'zustand';

import type {
    GymPlan,
    GymPlanSection,
} from '@src/core/entities/gym.interfaces';
import {
    cloneGymPlanAsDraft,
    cloneImportedGymPlanAsDraft,
    createEmptyGymPlanDraft,
    createEmptyGymPlanSection,
} from '@src/core/gyms/gymPlanDrafts';

export type GymPlanBuilderMode = 'create' | 'edit' | 'import';

interface GymPlanBuilderState {
    draft: GymPlan | null;
    isDirty: boolean;
    mode: GymPlanBuilderMode | null;
    addSection: () => void;
    checkpointDraft: () => void;
    clearDraft: () => void;
    hydrateDraft: (draft: GymPlan, mode: GymPlanBuilderMode) => void;
    removeSection: (sectionId: string) => void;
    setDraft: (
        draft:
            | GymPlan
            | null
            | ((currentDraft: GymPlan | null) => GymPlan | null),
    ) => void;
    startEditDraft: (gymPlan: GymPlan) => void;
    startImportedDraft: (gymPlan: GymPlan) => void;
    startNewDraft: () => void;
    updateDraft: (patch: Partial<GymPlan>) => void;
    updateSections: (sections: readonly GymPlanSection[]) => void;
}

const normalizeGymPlanSections = (
    sections: readonly GymPlanSection[],
): GymPlanSection[] =>
    sections.map((section, sectionIndex) => ({
        ...section,
        sortIndex: sectionIndex,
        exercises: section.exercises.map((exercise, exerciseIndex) => ({
            ...exercise,
            sortIndex: exerciseIndex,
        })),
    }));

export const useGymPlanBuilderStore = create<GymPlanBuilderState>()((set) => ({
    draft: null,
    isDirty: false,
    mode: null,
    addSection: () =>
        set((state) => {
            if (!state.draft) return {};

            return {
                draft: {
                    ...state.draft,
                    sections: normalizeGymPlanSections([
                        ...state.draft.sections,
                        createEmptyGymPlanSection(),
                    ]),
                },
                isDirty: true,
            };
        }),
    checkpointDraft: () => set({ isDirty: false }),
    clearDraft: () =>
        set({
            draft: null,
            isDirty: false,
            mode: null,
        }),
    hydrateDraft: (draft, mode) =>
        set({
            draft,
            isDirty: false,
            mode,
        }),
    removeSection: (sectionId) =>
        set((state) => {
            if (!state.draft) return {};

            return {
                draft: {
                    ...state.draft,
                    sections: normalizeGymPlanSections(
                        state.draft.sections.filter(
                            (section) => section.id !== sectionId,
                        ),
                    ),
                },
                isDirty: true,
            };
        }),
    setDraft: (draft) =>
        set((state) => ({
            draft:
                typeof draft === 'function'
                    ? draft(state.draft)
                    : draft,
            isDirty: true,
        })),
    startEditDraft: (gymPlan) =>
        set({
            draft: cloneGymPlanAsDraft(gymPlan),
            isDirty: true,
            mode: 'edit',
        }),
    startImportedDraft: (gymPlan) =>
        set({
            draft: cloneImportedGymPlanAsDraft(gymPlan),
            isDirty: true,
            mode: 'import',
        }),
    startNewDraft: () =>
        set({
            draft: createEmptyGymPlanDraft(),
            isDirty: true,
            mode: 'create',
        }),
    updateDraft: (patch) =>
        set((state) => {
            if (!state.draft) return {};

            return {
                draft: {
                    ...state.draft,
                    ...patch,
                },
                isDirty: true,
            };
        }),
    updateSections: (sections) =>
        set((state) => {
            if (!state.draft) return {};

            return {
                draft: {
                    ...state.draft,
                    sections: normalizeGymPlanSections(sections),
                },
                isDirty: true,
            };
        }),
}));
