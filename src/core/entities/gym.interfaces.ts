import type { UUID } from './entities';

export type GymSessionStatus = 'active' | 'completed' | 'discarded';
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

export interface GymPlan {
    id: UUID;
    name: string;
    description?: string;
    sections: GymPlanSection[];
    createdAtMs: number;
    updatedAtMs: number;
    isFavorite: boolean;
    status: GymPlanStatus;
    draftTargetGymPlanId?: UUID;
}

export interface GymExerciseRecordSet {
    id: UUID;
    setIndex: number;
    reps?: number;
    weightGrams?: number;
    durationSec?: number;
    distanceMeters?: number;
    rpeTenths?: number;
    isWarmup: boolean;
    completedAtMs?: number;
    notes?: string;
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymExerciseRecord {
    id: UUID;
    exerciseDefinitionId: UUID;
    sourceGymPlanExerciseId?: UUID;
    sortIndex: number;
    startedAtMs?: number;
    notes?: string;
    sets: GymExerciseRecordSet[];
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymSession {
    id: UUID;
    startedAtMs: number;
    endedAtMs?: number;
    status: GymSessionStatus;
    sourceGymPlanId?: UUID;
    notes?: string;
    exerciseRecords: GymExerciseRecord[];
    createdAtMs: number;
    updatedAtMs: number;
}
