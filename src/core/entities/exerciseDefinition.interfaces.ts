import type { UUID } from './common.interfaces';
import type { GymSessionListItem } from './gymSession.interfaces';

export type ExerciseDefinitionSource = 'system' | 'user';

export type ExerciseDefinitionAvailability = 'both' | 'workout' | 'gym';

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
    createdAtMs: number;
    updatedAtMs: number;
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
    stats?: ExerciseDefinitionStats;
}
