import type { UUID } from './common.interfaces';

export type GymPlanStatus = 'active' | 'archived' | 'draft';

export interface GymPlanExerciseTargetSet {
    id: UUID;
    setIndex: number;
    reps?: number;
    weightGrams?: number;
    durationSec?: number;
    distanceMeters?: number;
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymPlanExercise {
    id: UUID;
    exerciseDefinitionId: UUID;
    name?: string;
    sortIndex: number;
    notes?: string;
    targetSetDrafts?: GymPlanExerciseTargetSet[];
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymPlanSection {
    id: UUID;
    title?: string;
    sortIndex: number;
    exercises: GymPlanExercise[];
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymPlan extends GymPlanListItem {
    sections: GymPlanSection[];
    draftTargetGymPlanId?: UUID;
}

export interface GymPlanListItem {
    id: UUID;
    name?: string;
    description?: string;
    createdAtMs: number;
    updatedAtMs: number;
    isFavorite: boolean;
    status: GymPlanStatus;
    sectionCount: number;
    exerciseCount: number;
}
