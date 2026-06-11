import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import type {
    ExportedGymPlanExerciseV1,
    ExportedGymPlanFileV1,
    ExportedGymPlanSectionV1,
    ExportedGymPlanTargetSetV1,
    ExportedGymPlanV1,
} from '../exportGymPlan/exportTypes';
import {
    ARC_GYM_PLAN_EXTENSION,
    ARC_GYM_PLAN_KIND,
} from '../exportGymPlan/exportTypes';

export type ImportGymPlanResult =
    | { ok: true; gymPlan: ExportedGymPlanV1 }
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

const isExportedGymPlanTargetSetV1 = (
    value: unknown,
): value is ExportedGymPlanTargetSetV1 => {
    if (!isRecord(value)) return false;

    return (
        typeof value.setIndex === 'number' &&
        (value.reps === undefined || typeof value.reps === 'number') &&
        (value.weightGrams === undefined ||
            typeof value.weightGrams === 'number') &&
        (value.durationSec === undefined ||
            typeof value.durationSec === 'number') &&
        (value.distanceMeters === undefined ||
            typeof value.distanceMeters === 'number') &&
        (value.rpeTenths === undefined ||
            typeof value.rpeTenths === 'number')
    );
};

const isExportedGymPlanExerciseV1 = (
    value: unknown,
): value is ExportedGymPlanExerciseV1 => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.targetSets)) return false;

    return (
        typeof value.name === 'string' &&
        typeof value.sortIndex === 'number' &&
        isOptionalString(value.notes) &&
        value.targetSets.every(isExportedGymPlanTargetSetV1)
    );
};

const isExportedGymPlanSectionV1 = (
    value: unknown,
): value is ExportedGymPlanSectionV1 => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.exercises)) return false;

    return (
        isOptionalString(value.title) &&
        typeof value.sortIndex === 'number' &&
        value.exercises.every(isExportedGymPlanExerciseV1)
    );
};

const isExportedGymPlanV1 = (value: unknown): value is ExportedGymPlanV1 => {
    if (!isRecord(value)) return false;
    if (!Array.isArray(value.sections)) return false;

    return (
        isOptionalString(value.name) &&
        isOptionalString(value.description) &&
        value.sections.every(isExportedGymPlanSectionV1)
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

    return isExportedGymPlanV1(value.gymPlan);
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
            console.warn('GYM_PLAN_INVALID_SHAPE');
            return { ok: false, error: 'INVALID_SHAPE' };
        }

        return { ok: true, gymPlan: parsedUnknown.gymPlan };
    };
