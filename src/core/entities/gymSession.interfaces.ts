import type { UUID } from './common.interfaces';

export type GymSessionStatus = 'active' | 'completed';

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

export interface GymSession extends GymSessionListItem {
    notes?: string;
    exerciseRecords: GymExerciseRecord[];
    createdAtMs: number;
    updatedAtMs: number;
}

export interface GymSessionListItem {
    id: UUID;
    startedAtMs: number;
    endedAtMs?: number;
    status: GymSessionStatus;
    sourceGymPlanId?: UUID;
    sourceGymPlanName?: string;
    exerciseRecordCount: number;
    setCount: number;
}
