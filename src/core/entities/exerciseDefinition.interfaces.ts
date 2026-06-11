import type { UUID } from './common.interfaces';
import type { GymSessionListItem } from './gymSession.interfaces';
import type { TrainingSessionKind } from './trainingSession.interfaces';

export type ExerciseDefinitionSource = 'system' | 'user';

export type ExerciseDefinitionAvailability = 'both' | 'workout' | 'gym';

export type ExerciseDefinitionDeleteBlockReason = 'system' | 'referenced';

export type ExerciseDefinitionReferenceKind = 'gymPlan' | 'workout';

export type ExerciseTrackingField =
    | 'reps'
    | 'weight'
    | 'duration'
    | 'distance'
    | 'rpe';

export interface ExerciseDefinitionListItem {
    id: UUID;
    name: string;
    normalizedName: string;
    source: ExerciseDefinitionSource;
    availability: ExerciseDefinitionAvailability;
    canDelete?: boolean;
    deleteBlockReason?: ExerciseDefinitionDeleteBlockReason;
    createdAtMs: number;
    updatedAtMs: number;
}

export interface ExerciseDefinitionReferenceItem {
    id: UUID;
    kind: ExerciseDefinitionReferenceKind;
    name: string;
}

export interface ExerciseDefinitionReferences {
    items: ExerciseDefinitionReferenceItem[];
}

export interface ExerciseDefinitionRecentSessionItem {
    id: UUID;
    kind: TrainingSessionKind;
    title: string;
    sourceGymPlanName?: string;
}

export interface ExerciseDefinitionTargetSetData {
    reps?: number;
    weightGrams?: number;
    durationSec?: number;
    distanceMeters?: number;
    rpeTenths?: number;
}

export interface ExerciseDefinitionData {
    exerciseDefinitionId: UUID;
    defaultTrackingFields: ExerciseTrackingField[];
    defaultTargetSet?: ExerciseDefinitionTargetSetData;
    notes?: string;
    createdAtMs: number;
    updatedAtMs: number;
}

export interface ExerciseDefinitionSetMetric {
    gymExerciseRecordSetId: UUID;
    gymSessionId: UUID;
    value: number;
    reps?: number;
    durationSec?: number;
    completedAtMs?: number;
}

export interface ExerciseDefinitionStats {
    exerciseDefinitionId: UUID;
    weightPr?: ExerciseDefinitionSetMetric;
    distancePr?: ExerciseDefinitionSetMetric;
    lastCompletedGymSession?: GymSessionListItem;
    recentCompletedGymSessions: GymSessionListItem[];
    createdAtMs: number;
    updatedAtMs: number;
}

export interface ExerciseDefinition extends ExerciseDefinitionListItem {
    data?: ExerciseDefinitionData;
    references?: ExerciseDefinitionReferences;
    recentSessions?: ExerciseDefinitionRecentSessionItem[];
    stats?: ExerciseDefinitionStats;
}
