import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import type {
    GymPlan,
    GymPlanExercise,
    GymPlanSection,
    GymPlanStatus,
} from '../entities/gym.interfaces';
import {
    ARC_GYM_PLAN_EXTENSION,
    ARC_GYM_PLAN_KIND,
    type ExportedGymPlanFileV1,
} from '../exportGymPlan/exportTypes';

export type ImportGymPlanResult =
    | { ok: true; gymPlan: GymPlan }
    | {
          ok: false;
          error:
              | 'CANCELLED'
              | 'READ_FAILED'
              | 'PARSE_FAILED'
              | 'INVALID_EXTENSION'
              | 'INVALID_KIND'
              | 'INVALID_SHAPE';
      };

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isOptionalString = (value: unknown): value is string | undefined =>
    value === undefined || typeof value === 'string';

const isOptionalNumber = (value: unknown): value is number | undefined =>
    value === undefined || typeof value === 'number';

const isGymPlanStatus = (value: unknown): value is GymPlanStatus =>
    value === 'active' || value === 'archived' || value === 'draft';

const isGymPlanExercise = (value: unknown): value is GymPlanExercise => {
    if (!isRecord(value)) return false;

    return (
        typeof value.id === 'string' &&
        typeof value.exerciseDefinitionId === 'string' &&
        typeof value.sortIndex === 'number' &&
        isOptionalNumber(value.targetSets) &&
        isOptionalNumber(value.targetReps) &&
        isOptionalNumber(value.targetWeightGrams) &&
        isOptionalNumber(value.targetDurationSec) &&
        isOptionalNumber(value.targetDistanceMeters) &&
        isOptionalNumber(value.restSec) &&
        isOptionalString(value.notes) &&
        typeof value.createdAtMs === 'number' &&
        typeof value.updatedAtMs === 'number'
    );
};

const isGymPlanSection = (value: unknown): value is GymPlanSection => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.exercises)) return false;

    return (
        typeof value.id === 'string' &&
        isOptionalString(value.title) &&
        typeof value.sortIndex === 'number' &&
        value.exercises.every(isGymPlanExercise) &&
        typeof value.createdAtMs === 'number' &&
        typeof value.updatedAtMs === 'number'
    );
};

const isGymPlan = (value: unknown): value is GymPlan => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.sections)) return false;

    return (
        typeof value.id === 'string' &&
        typeof value.name === 'string' &&
        isOptionalString(value.description) &&
        value.sections.every(isGymPlanSection) &&
        typeof value.createdAtMs === 'number' &&
        typeof value.updatedAtMs === 'number' &&
        typeof value.isFavorite === 'boolean' &&
        isGymPlanStatus(value.status) &&
        isOptionalString(value.draftTargetGymPlanId)
    );
};

const isExportedGymPlanFileV1 = (
    value: unknown,
): value is ExportedGymPlanFileV1 => {
    if (!isRecord(value)) return false;

    if (value.version !== 1) return false;
    if (value.kind !== ARC_GYM_PLAN_KIND) return false;
    if (typeof value.exportedAt !== 'string') return false;

    if (!isRecord(value.app)) return false;
    if (typeof value.app.name !== 'string') return false;
    if (value.app.platform !== 'mobile') return false;

    return isGymPlan(value.gymPlan);
};

export const importGymPlanFromFile =
    async (): Promise<ImportGymPlanResult> => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['*/*'],
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            return { ok: false, error: 'CANCELLED' };
        }

        const asset = result.assets[0];

        if (!asset.name.toLowerCase().endsWith(ARC_GYM_PLAN_EXTENSION)) {
            return { ok: false, error: 'INVALID_EXTENSION' };
        }

        let contents: string;
        try {
            const file = new File(asset.uri);
            contents = await file.text();
        } catch (error: unknown) {
            console.warn('GYM_PLAN_READ_FAILED', error);
            return { ok: false, error: 'READ_FAILED' };
        }

        let parsedUnknown: unknown;
        try {
            parsedUnknown = JSON.parse(contents) as unknown;
        } catch (error: unknown) {
            console.warn('GYM_PLAN_PARSE_FAILED', error);
            return { ok: false, error: 'PARSE_FAILED' };
        }

        if (isRecord(parsedUnknown) && 'kind' in parsedUnknown) {
            if (parsedUnknown.kind !== ARC_GYM_PLAN_KIND) {
                console.warn('GYM_PLAN_INVALID_KIND', parsedUnknown.kind);
                return { ok: false, error: 'INVALID_KIND' };
            }
        }

        if (!isExportedGymPlanFileV1(parsedUnknown)) {
            console.warn('GYM_PLAN_INVALID_SHAPE', parsedUnknown);
            return { ok: false, error: 'INVALID_SHAPE' };
        }

        return { ok: true, gymPlan: parsedUnknown.gymPlan };
    };
