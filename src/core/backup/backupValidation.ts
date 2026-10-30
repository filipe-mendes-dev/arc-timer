import { isRecord, isWorkoutSessionStats } from '@src/db/mappers/jsonGuards';

import { BackupError } from './backupErrors';
import {
    ARC_BACKUP_FORMAT_VERSION,
    ARC_BACKUP_KIND,
    CURRENT_BACKUP_SCHEMA_VERSION,
    type BackupFileV1,
    type BackupTablesV1,
} from './backupTypes';

type FieldValidator = (value: unknown) => boolean;
type RowValidators = {
    [Table in keyof BackupTablesV1]: {
        [Field in keyof BackupTablesV1[Table][number]]: FieldValidator;
    };
};

const isText = (value: unknown): value is string => typeof value === 'string';
const isId = (value: unknown): boolean => isText(value) && value.trim().length > 0;
const isSignedInteger = (value: unknown): value is number =>
    typeof value === 'number' && Number.isSafeInteger(value);
const isInteger = (value: unknown): value is number => isSignedInteger(value) && value >= 0;
const isPositiveInteger = (value: unknown): boolean => isInteger(value) && value > 0;
const isBoolean = (value: unknown): boolean => typeof value === 'boolean';
const isNullableText = (value: unknown): boolean => value === null || isText(value);
const isNullableId = (value: unknown): boolean => value === null || isId(value);
const isNullableInteger = (value: unknown): boolean => value === null || isInteger(value);
const isNullablePositiveInteger = (value: unknown): boolean =>
    value === null || isPositiveInteger(value);
const isRpe = (value: unknown): boolean => value === null || (isInteger(value) && value <= 100);
const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value);

const isStatsJson = (value: unknown): boolean => {
    if (value === null) return true;
    if (!isText(value)) return false;
    try {
        const parsed: unknown = JSON.parse(value);
        if (!isWorkoutSessionStats(parsed)) return false;
        return Object.entries(parsed).every(([key, stat]: [string, unknown]) => {
            if (stat === undefined) return true;
            const isValidNumber = (entry: unknown): boolean => {
                if (key.startsWith('completed')) return isInteger(entry);
                return typeof entry === 'number' && Number.isFinite(entry) && entry >= 0;
            };
            if (isUnknownArray(stat)) return stat.every(isValidNumber);
            return isValidNumber(stat);
        });
    } catch {
        return false;
    }
};

const timestamps = { createdAtMs: isInteger, updatedAtMs: isInteger };
const tracking = {
    reps: isNullableInteger,
    weightGrams: isNullableInteger,
    durationSec: isNullableInteger,
    distanceMeters: isNullableInteger,
    rpeTenths: isRpe,
};
const gymSetTracking = {
    ...tracking,
    reps: isNullablePositiveInteger,
    durationSec: isNullablePositiveInteger,
    distanceMeters: isNullablePositiveInteger,
};

const rowValidators: RowValidators = {
    exerciseDefinitions: {
        ...timestamps,
        id: isId,
        name: isText,
        normalizedName: isText,
        source: (value) => value === 'system' || value === 'user',
        availability: (value) => value === 'both' || value === 'workout' || value === 'gym',
    },
    exerciseDefinitionData: { ...timestamps, exerciseDefinitionId: isId, notes: isNullableText },
    exerciseDefinitionDefaultTrackingFields: {
        ...timestamps,
        ...tracking,
        exerciseDefinitionId: isId,
        hasReps: isBoolean,
        hasWeight: isBoolean,
        hasDuration: isBoolean,
        hasDistance: isBoolean,
        hasRpe: isBoolean,
    },
    workoutVersions: { id: isId, name: isText, updatedAtMs: isInteger },
    workouts: {
        id: isId,
        name: isText,
        currentVersionId: isId,
        createdAtMs: isInteger,
        isFavorite: isBoolean,
        sortIndex: isSignedInteger,
    },
    workoutBlocks: {
        id: isId,
        workoutVersionId: isId,
        sortIndex: isInteger,
        title: isNullableText,
        sets: isPositiveInteger,
        restBetweenSetsSec: isInteger,
        restBetweenExercisesSec: isInteger,
    },
    workoutExercises: {
        id: isId,
        blockId: isId,
        sortIndex: isInteger,
        exerciseDefinitionId: isNullableId,
        mode: (value) => value === 'time' || value === 'reps',
        value: isPositiveInteger,
        tempo: isNullableText,
    },
    workoutSessions: {
        id: isId,
        startedAtMs: isInteger,
        endedAtMs: isInteger,
        workoutVersionId: isId,
        totalDurationSec: isNullableInteger,
        statsJson: isStatsJson,
    },
    gymPlans: {
        ...timestamps,
        id: isId,
        name: isText,
        description: isNullableText,
        isFavorite: isBoolean,
        status: (value) => value === 'active' || value === 'archived' || value === 'draft',
        draftTargetGymPlanId: isNullableId,
    },
    gymPlanSections: {
        ...timestamps,
        id: isId,
        gymPlanId: isId,
        title: isNullableText,
        sortIndex: isInteger,
    },
    gymPlanExercises: {
        ...timestamps,
        id: isId,
        gymPlanSectionId: isId,
        exerciseDefinitionId: isId,
        sortIndex: isInteger,
        notes: isNullableText,
    },
    gymPlanExerciseTargetSets: {
        ...timestamps,
        ...gymSetTracking,
        id: isId,
        gymPlanExerciseId: isId,
        setIndex: isInteger,
    },
    gymSessions: {
        ...timestamps,
        id: isId,
        startedAtMs: isInteger,
        endedAtMs: isNullableInteger,
        status: (value) => value === 'active' || value === 'completed',
        sourceGymPlanId: isNullableId,
        sourceGymPlanName: isNullableText,
        notes: isNullableText,
    },
    gymExerciseRecords: {
        ...timestamps,
        id: isId,
        gymSessionId: isId,
        exerciseDefinitionId: isId,
        sourceGymPlanSectionId: isNullableId,
        sourceGymPlanSectionTitle: isNullableText,
        sourceGymPlanExerciseId: isNullableId,
        sortIndex: isInteger,
        startedAtMs: isNullableInteger,
        notes: isNullableText,
    },
    gymExerciseRecordSets: {
        ...timestamps,
        ...gymSetTracking,
        id: isId,
        gymExerciseRecordId: isId,
        setIndex: isInteger,
        isWarmup: isBoolean,
        completedAtMs: isNullableInteger,
        notes: isNullableText,
    },
    exerciseDefinitionStats: {
        ...timestamps,
        exerciseDefinitionId: isId,
        weightPrSetId: isNullableId,
        weightPrGymSessionId: isNullableId,
        weightPrGrams: isNullableInteger,
        weightPrReps: isNullableInteger,
        weightPrCompletedAtMs: isNullableInteger,
        distancePrSetId: isNullableId,
        distancePrGymSessionId: isNullableId,
        distancePrMeters: isNullableInteger,
        distancePrReps: isNullableInteger,
        distancePrCompletedAtMs: isNullableInteger,
        lastCompletedGymSessionId: isNullableId,
    },
    exerciseDefinitionRecentGymSessions: {
        ...timestamps,
        exerciseDefinitionId: isId,
        gymSessionId: isId,
        sortIndex: isInteger,
        startedAtMs: isInteger,
    },
};

const isBackupTables = (value: unknown): value is BackupTablesV1 => {
    if (!isRecord(value)) return false;
    if (Object.keys(value).length !== Object.keys(rowValidators).length) return false;
    return Object.entries(rowValidators).every(([key, fields]) => {
        const rows = value[key];
        if (!isUnknownArray(rows)) return false;
        return rows.every((row) => {
            if (!isRecord(row)) return false;
            if (Object.keys(row).length !== Object.keys(fields).length) return false;
            return Object.entries(fields).every(([field, validate]) => validate(row[field]));
        });
    });
};

const hasValidSessionData = (tables: BackupTablesV1): boolean => {
    if (tables.workoutSessions.some((session) => session.endedAtMs < session.startedAtMs)) {
        return false;
    }
    if (
        tables.gymSessions.some((session) => {
            if (session.status === 'active') return session.endedAtMs !== null;
            return session.endedAtMs === null || session.endedAtMs < session.startedAtMs;
        })
    ) {
        return false;
    }
    return tables.gymExerciseRecordSets.every((set) => {
        if (set.completedAtMs === null) return true;
        return [set.reps, set.weightGrams, set.durationSec, set.distanceMeters, set.rpeTenths].some(
            (value) => value !== null && value > 0,
        );
    });
};

export const validateBackup = (value: unknown): BackupFileV1 => {
    if (!isRecord(value)) throw new BackupError('INVALID_DATA');
    if (value.kind !== ARC_BACKUP_KIND) throw new BackupError('INVALID_KIND');
    if (value.version !== ARC_BACKUP_FORMAT_VERSION) throw new BackupError('UNSUPPORTED_FORMAT');
    if (value.schemaVersion !== CURRENT_BACKUP_SCHEMA_VERSION)
        throw new BackupError('UNSUPPORTED_SCHEMA');
    if (!isText(value.exportedAt) || !Number.isFinite(Date.parse(value.exportedAt))) {
        throw new BackupError('INVALID_DATA');
    }
    if (!isBackupTables(value.tables)) throw new BackupError('INVALID_DATA');
    if (!hasValidSessionData(value.tables)) throw new BackupError('INVALID_DATA');
    return {
        kind: value.kind,
        version: value.version,
        schemaVersion: value.schemaVersion,
        exportedAt: value.exportedAt,
        tables: value.tables,
    };
};

export const parseBackupJson = (contents: string): BackupFileV1 => {
    let value: unknown;
    try {
        value = JSON.parse(contents);
    } catch {
        throw new BackupError('INVALID_JSON');
    }
    return validateBackup(value);
};
