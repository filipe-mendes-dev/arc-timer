import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import { importGymPlanFromFile } from '@src/core/importGymPlan/importGymPlan';

export type ImportGymPlanDraftErrorKey =
    | 'gymPlans.import.errors.invalidExtension'
    | 'gymPlans.import.errors.invalidKind'
    | 'gymPlans.import.errors.invalidShape'
    | 'gymPlans.import.errors.parseFailed'
    | 'gymPlans.import.errors.readFailed'
    | 'gymPlans.import.errors.unexpected';

interface ImportGymPlanDraftInput {
    startImportedDraft: (gymPlan: GymPlan) => Promise<unknown>;
}

interface ImportGymPlanDraftSuccess {
    didImport: true;
    errorKey?: undefined;
}

interface ImportGymPlanDraftFailure {
    didImport: false;
    errorKey?: ImportGymPlanDraftErrorKey;
}

export type ImportGymPlanDraftResult =
    | ImportGymPlanDraftSuccess
    | ImportGymPlanDraftFailure;

const errorKeyByImportError = {
    INVALID_EXTENSION: 'gymPlans.import.errors.invalidExtension',
    INVALID_KIND: 'gymPlans.import.errors.invalidKind',
    INVALID_SHAPE: 'gymPlans.import.errors.invalidShape',
    PARSE_FAILED: 'gymPlans.import.errors.parseFailed',
    READ_FAILED: 'gymPlans.import.errors.readFailed',
} satisfies Record<string, ImportGymPlanDraftErrorKey>;

export const importGymPlanDraftFromFile = async ({
    startImportedDraft,
}: ImportGymPlanDraftInput): Promise<ImportGymPlanDraftResult> => {
    try {
        const result = await importGymPlanFromFile();

        if (!result.ok) {
            if (result.error === 'CANCELLED') {
                return { didImport: false };
            }

            return {
                didImport: false,
                errorKey: errorKeyByImportError[result.error],
            };
        }

        await startImportedDraft(result.gymPlan);

        return { didImport: true };
    } catch (error: unknown) {
        console.warn('Gym plan import failed unexpectedly', error);

        return {
            didImport: false,
            errorKey: 'gymPlans.import.errors.unexpected',
        };
    }
};
