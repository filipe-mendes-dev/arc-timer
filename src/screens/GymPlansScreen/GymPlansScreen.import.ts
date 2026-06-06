import type { TFunction } from 'i18next';

import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import { importGymPlanFromFile } from '@src/core/importGymPlan/importGymPlan';

interface ImportErrorTranslationMap {
    INVALID_EXTENSION: 'gymPlans.import.errors.invalidExtension';
    INVALID_KIND: 'gymPlans.import.errors.invalidKind';
    INVALID_SHAPE: 'gymPlans.import.errors.invalidShape';
    PARSE_FAILED: 'gymPlans.import.errors.parseFailed';
    READ_FAILED: 'gymPlans.import.errors.readFailed';
}

interface ImportGymPlanDraftInput {
    startImportedDraft: (gymPlan: GymPlan) => Promise<unknown>;
    t: TFunction;
}

export interface ImportGymPlanDraftResult {
    didImport: boolean;
    errorMessage?: string;
}

const messageByError: Record<
    keyof ImportErrorTranslationMap,
    ImportErrorTranslationMap[keyof ImportErrorTranslationMap]
> = {
    INVALID_EXTENSION: 'gymPlans.import.errors.invalidExtension',
    INVALID_KIND: 'gymPlans.import.errors.invalidKind',
    INVALID_SHAPE: 'gymPlans.import.errors.invalidShape',
    PARSE_FAILED: 'gymPlans.import.errors.parseFailed',
    READ_FAILED: 'gymPlans.import.errors.readFailed',
};

export const importGymPlanDraftFromFile = async ({
    startImportedDraft,
    t,
}: ImportGymPlanDraftInput): Promise<ImportGymPlanDraftResult> => {
    try {
        const result = await importGymPlanFromFile();

        if (!result.ok) {
            if (result.error === 'CANCELLED') {
                return { didImport: false };
            }

            return {
                didImport: false,
                errorMessage: t(messageByError[result.error]),
            };
        }

        await startImportedDraft(result.gymPlan);

        return { didImport: true };
    } catch (error: unknown) {
        console.warn('Gym plan import failed unexpectedly', error);

        return {
            didImport: false,
            errorMessage: t('gymPlans.import.errors.unexpected'),
        };
    }
};
