import type {
    GymPlan,
    GymPlanExercise,
    GymPlanSection,
} from '@src/core/entities/gymPlan.interfaces';
import type { ExportedGymPlanV1 } from '@src/core/exportGymPlan/exportTypes';
import { withGymPlanExerciseTargetSets } from '@src/core/gyms/gymPlanTargetSets';
import { uid } from '@src/core/id';
import { importGymPlanFromFile } from '@src/core/importGymPlan/importGymPlan';

export type ImportGymPlanDraftErrorKey =
    | 'gymPlans.import.errors.invalidExtension'
    | 'gymPlans.import.errors.invalidKind'
    | 'gymPlans.import.errors.invalidShape'
    | 'gymPlans.import.errors.parseFailed'
    | 'gymPlans.import.errors.readFailed'
    | 'gymPlans.import.errors.unexpected';

interface ImportGymPlanDraftInput {
    resolveExerciseDefinitionIdByName: (name: string) => string | null;
    startImportedDraft: (gymPlan: GymPlan) => Promise<unknown>;
}

interface CreateImportedGymPlanDraftInput {
    gymPlan: ExportedGymPlanV1;
    resolveExerciseDefinitionIdByName: (name: string) => string | null;
    createId?: () => string;
    nowMs?: number;
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

export const createImportedGymPlanDraft = ({
    gymPlan,
    resolveExerciseDefinitionIdByName,
    createId = uid,
    nowMs = Date.now(),
}: CreateImportedGymPlanDraftInput): GymPlan | null => {
    const sections: GymPlanSection[] = [];

    for (const [sectionIndex, section] of gymPlan.sections.entries()) {
        const exercises: GymPlanExercise[] = [];

        for (const [exerciseIndex, exercise] of section.exercises.entries()) {
            const name = exercise.name.trim();
            if (name.length === 0) return null;

            const exerciseDefinitionId =
                resolveExerciseDefinitionIdByName(name);
            if (!exerciseDefinitionId) return null;

            const nextExercise = withGymPlanExerciseTargetSets(
                {
                    id: createId(),
                    exerciseDefinitionId,
                    name,
                    sortIndex: exerciseIndex,
                    notes: exercise.notes,
                    createdAtMs: nowMs,
                    updatedAtMs: nowMs,
                },
                exercise.targetSets.map((targetSet, targetSetIndex) => ({
                    id: createId(),
                    setIndex: targetSetIndex,
                    reps: targetSet.reps,
                    weightGrams: targetSet.weightGrams,
                    durationSec: targetSet.durationSec,
                    distanceMeters: targetSet.distanceMeters,
                    rpeTenths: targetSet.rpeTenths,
                    createdAtMs: nowMs,
                    updatedAtMs: nowMs,
                })),
            );

            exercises.push(nextExercise);
        }

        sections.push({
            id: createId(),
            title: section.title,
            sortIndex: sectionIndex,
            exercises,
            createdAtMs: nowMs,
            updatedAtMs: nowMs,
        });
    }

    const exerciseCount = sections.reduce(
        (count, section) => count + section.exercises.length,
        0,
    );

    return {
        id: createId(),
        name: gymPlan.name ?? '',
        description: gymPlan.description,
        sections,
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
        isFavorite: false,
        status: 'active',
        sectionCount: sections.length,
        exerciseCount,
        draftTargetGymPlanId: undefined,
    };
};

export const importGymPlanDraftFromFile = async ({
    resolveExerciseDefinitionIdByName,
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

        const gymPlan = createImportedGymPlanDraft({
            gymPlan: result.gymPlan,
            resolveExerciseDefinitionIdByName,
        });

        if (!gymPlan) {
            return {
                didImport: false,
                errorKey: 'gymPlans.import.errors.invalidShape',
            };
        }

        await startImportedDraft(gymPlan);

        return { didImport: true };
    } catch (error: unknown) {
        console.warn('Gym plan import failed unexpectedly', error);

        return {
            didImport: false,
            errorKey: 'gymPlans.import.errors.unexpected',
        };
    }
};
