export const ARC_BACKUP_KIND = 'arc-timer/backup';
export const ARC_BACKUP_EXTENSION = '.arcbak';
export const ARC_BACKUP_MIME = 'application/vnd.arctimer.backup+json';
export const ARC_BACKUP_FORMAT_VERSION = 1;
export const CURRENT_BACKUP_SCHEMA_VERSION = 1;

interface BackupTimestampsV1 {
    createdAtMs: number;
    updatedAtMs: number;
}

interface BackupTrackingV1 {
    reps: number | null;
    weightGrams: number | null;
    durationSec: number | null;
    distanceMeters: number | null;
    rpeTenths: number | null;
}

export interface BackupExerciseDefinitionV1 extends BackupTimestampsV1 {
    id: string;
    name: string;
    normalizedName: string;
    source: 'system' | 'user';
    availability: 'both' | 'workout' | 'gym';
}

export interface BackupExerciseDataV1 extends BackupTimestampsV1 {
    exerciseDefinitionId: string;
    notes: string | null;
}

export interface BackupDefaultTrackingV1 extends BackupTimestampsV1, BackupTrackingV1 {
    exerciseDefinitionId: string;
    hasReps: boolean;
    hasWeight: boolean;
    hasDuration: boolean;
    hasDistance: boolean;
    hasRpe: boolean;
}

export interface BackupWorkoutVersionV1 {
    id: string;
    name: string;
    updatedAtMs: number;
}

export interface BackupWorkoutV1 {
    id: string;
    name: string;
    currentVersionId: string;
    createdAtMs: number;
    isFavorite: boolean;
    sortIndex: number;
}

export interface BackupWorkoutBlockV1 {
    id: string;
    workoutVersionId: string;
    sortIndex: number;
    title: string | null;
    sets: number;
    restBetweenSetsSec: number;
    restBetweenExercisesSec: number;
}

export interface BackupWorkoutExerciseV1 {
    id: string;
    blockId: string;
    sortIndex: number;
    exerciseDefinitionId: string | null;
    mode: 'time' | 'reps';
    value: number;
    tempo: string | null;
}

export interface BackupWorkoutSessionV1 {
    id: string;
    startedAtMs: number;
    endedAtMs: number;
    workoutVersionId: string;
    totalDurationSec: number | null;
    statsJson: string | null;
}

export interface BackupGymPlanV1 extends BackupTimestampsV1 {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
    status: 'active' | 'archived' | 'draft';
    draftTargetGymPlanId: string | null;
}

export interface BackupGymSectionV1 extends BackupTimestampsV1 {
    id: string;
    gymPlanId: string;
    title: string | null;
    sortIndex: number;
}

export interface BackupGymPlanExerciseV1 extends BackupTimestampsV1 {
    id: string;
    gymPlanSectionId: string;
    exerciseDefinitionId: string;
    sortIndex: number;
    notes: string | null;
}

export interface BackupTargetSetV1 extends BackupTimestampsV1, BackupTrackingV1 {
    id: string;
    gymPlanExerciseId: string;
    setIndex: number;
}

export interface BackupGymSessionV1 extends BackupTimestampsV1 {
    id: string;
    startedAtMs: number;
    endedAtMs: number | null;
    status: 'active' | 'completed';
    sourceGymPlanId: string | null;
    sourceGymPlanName: string | null;
    notes: string | null;
}

export interface BackupGymRecordV1 extends BackupTimestampsV1 {
    id: string;
    gymSessionId: string;
    exerciseDefinitionId: string;
    sourceGymPlanSectionId: string | null;
    sourceGymPlanSectionTitle: string | null;
    sourceGymPlanExerciseId: string | null;
    sortIndex: number;
    startedAtMs: number | null;
    notes: string | null;
}

export interface BackupRecordSetV1 extends BackupTimestampsV1, BackupTrackingV1 {
    id: string;
    gymExerciseRecordId: string;
    setIndex: number;
    isWarmup: boolean;
    completedAtMs: number | null;
    notes: string | null;
}

export interface BackupExerciseStatsV1 extends BackupTimestampsV1 {
    exerciseDefinitionId: string;
    weightPrSetId: string | null;
    weightPrGymSessionId: string | null;
    weightPrGrams: number | null;
    weightPrReps: number | null;
    weightPrCompletedAtMs: number | null;
    distancePrSetId: string | null;
    distancePrGymSessionId: string | null;
    distancePrMeters: number | null;
    distancePrReps: number | null;
    distancePrCompletedAtMs: number | null;
    lastCompletedGymSessionId: string | null;
}

export interface BackupRecentSessionV1 extends BackupTimestampsV1 {
    exerciseDefinitionId: string;
    gymSessionId: string;
    sortIndex: number;
    startedAtMs: number;
}

export interface BackupTablesV1 {
    exerciseDefinitions: BackupExerciseDefinitionV1[];
    exerciseDefinitionData: BackupExerciseDataV1[];
    exerciseDefinitionDefaultTrackingFields: BackupDefaultTrackingV1[];
    workoutVersions: BackupWorkoutVersionV1[];
    workouts: BackupWorkoutV1[];
    workoutBlocks: BackupWorkoutBlockV1[];
    workoutExercises: BackupWorkoutExerciseV1[];
    workoutSessions: BackupWorkoutSessionV1[];
    gymPlans: BackupGymPlanV1[];
    gymPlanSections: BackupGymSectionV1[];
    gymPlanExercises: BackupGymPlanExerciseV1[];
    gymPlanExerciseTargetSets: BackupTargetSetV1[];
    gymSessions: BackupGymSessionV1[];
    gymExerciseRecords: BackupGymRecordV1[];
    gymExerciseRecordSets: BackupRecordSetV1[];
    exerciseDefinitionStats: BackupExerciseStatsV1[];
    exerciseDefinitionRecentGymSessions: BackupRecentSessionV1[];
}

export interface BackupFileV1 {
    kind: typeof ARC_BACKUP_KIND;
    version: typeof ARC_BACKUP_FORMAT_VERSION;
    schemaVersion: typeof CURRENT_BACKUP_SCHEMA_VERSION;
    exportedAt: string;
    tables: BackupTablesV1;
}
