import { create } from 'zustand';

import type { GymPlan } from '@src/core/entities/gym.interfaces';
import {
    cloneGymPlanAsDraft,
    cloneImportedGymPlanAsDraft,
    createEmptyGymPlanDraft,
} from '@src/core/gyms/gymPlanDrafts';

export type GymPlanBuilderMode = 'create' | 'edit' | 'import';

interface GymPlanBuilderState {
    draft: GymPlan | null;
    isDirty: boolean;
    mode: GymPlanBuilderMode | null;
    checkpointDraft: () => void;
    clearDraft: () => void;
    hydrateDraft: (draft: GymPlan, mode: GymPlanBuilderMode) => void;
    setDraft: (
        draft:
            | GymPlan
            | null
            | ((currentDraft: GymPlan | null) => GymPlan | null),
    ) => void;
    startEditDraft: (gymPlan: GymPlan) => void;
    startImportedDraft: (gymPlan: GymPlan) => void;
    startNewDraft: () => void;
}

export const useGymPlanBuilderStore = create<GymPlanBuilderState>()((set) => ({
    draft: null,
    isDirty: false,
    mode: null,
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
}));
