import type {
    GymPlan,
    GymPlanExercise,
    GymPlanExerciseTargetSet,
    GymPlanListItem,
    GymPlanSection,
} from '@src/core/entities/gymPlan.interfaces';

import { createGymError, gymErrors } from '../../repositories/gyms/gymErrors';
import type { GymPlanRepository } from '../../repositories/gyms/gymPlanRepositoryFactory';
import { systemClock, type Clock } from '../../repositories/repositoryClock';
import type { ExerciseDefinitionService } from '../exerciseDefinitions/exerciseDefinitionServiceFactory';

export interface ListGymPlansInput {
    includeArchived?: boolean;
}

export interface DiscardStaleDraftGymPlanInput {
    maxAgeMs: number;
}

export interface GymPlanService {
    listGymPlanItems: (input?: ListGymPlansInput) => GymPlanListItem[];
    getGymPlanById: (id: string) => GymPlan | null;
    getDraftGymPlan: () => GymPlan | null;
    upsertDraftGymPlan: (gymPlan: GymPlan) => void;
    commitGymPlanDraft: () => GymPlan;
    discardGymPlanDraft: () => void;
    toggleFavorite: (gymPlanId: GymPlan['id']) => void;
    archiveGymPlan: (id: string) => void;
    restoreGymPlan: (id: string) => void;
    deleteGymPlan: (id: string) => void;
}

export interface CreateGymPlanServiceArgs {
    clock?: Clock;
    exerciseDefinitionService: ExerciseDefinitionService;
    gymPlanRepository: GymPlanRepository;
}

interface PersistableGymPlanRows {
    exercises: Array<{
        createdAtMs: number;
        exerciseDefinitionId: string;
        gymPlanSectionId: string;
        id: string;
        notes: string | null;
        sortIndex: number;
        updatedAtMs: number;
    }>;
    sections: Array<{
        createdAtMs: number;
        gymPlanId: string;
        id: string;
        sortIndex: number;
        title: string | null;
        updatedAtMs: number;
    }>;
    targetSets: Array<{
        createdAtMs: number;
        distanceMeters: number | null;
        durationSec: number | null;
        gymPlanExerciseId: string;
        id: string;
        reps: number | null;
        setIndex: number;
        updatedAtMs: number;
        weightGrams: number | null;
    }>;
}

const assertNonEmptyText = (value: string): void => {
    if (value.trim().length === 0) {
        throw createGymError(gymErrors.invalidGymPlan);
    }
};

const assertExerciseDefinitionCanBeUsed = (
    exerciseDefinitionId: string,
    exerciseDefinitionService: ExerciseDefinitionService,
): void => {
    const definition = exerciseDefinitionService.getById(exerciseDefinitionId);
    if (!definition) {
        throw createGymError(gymErrors.exerciseDefinitionNotFound);
    }

    if (definition.availability === 'workout') {
        throw createGymError(gymErrors.exerciseDefinitionNotGymAvailable);
    }
};

const assertGymPlanCanBePersisted = (
    gymPlan: GymPlan,
    exerciseDefinitionService: ExerciseDefinitionService,
): void => {
    assertNonEmptyText(gymPlan.id);
    if (gymPlan.status !== 'draft') {
        assertNonEmptyText(gymPlan.name ?? '');
    }

    gymPlan.sections.forEach((section) => {
        assertNonEmptyText(section.id);

        section.exercises.forEach((exercise) => {
            assertNonEmptyText(exercise.id);
            assertExerciseDefinitionCanBeUsed(
                exercise.exerciseDefinitionId,
                exerciseDefinitionService,
            );
            (exercise.targetSetDrafts ?? []).forEach((targetSet) => {
                assertNonEmptyText(targetSet.id);
            });
        });
    });
};

const getExerciseTargetSetsForPersistence = (
    exercise: GymPlanExercise,
): GymPlanExerciseTargetSet[] => {
    if (!exercise.targetSetDrafts) return [];

    return exercise.targetSetDrafts;
};

const assertGymPlanCanBeCommitted = (
    gymPlan: GymPlan,
    exerciseDefinitionService: ExerciseDefinitionService,
): void => {
    assertGymPlanCanBePersisted(gymPlan, exerciseDefinitionService);

    if (gymPlan.sections.length === 0) {
        throw createGymError(gymErrors.invalidGymPlan);
    }

    gymPlan.sections.forEach((section) => {
        if (section.exercises.length === 0) {
            throw createGymError(gymErrors.invalidGymPlan);
        }
    });
};

const gymPlanRowsFromAggregate = (
    gymPlan: GymPlan,
    nowMs: number,
): PersistableGymPlanRows => {
    const sections: PersistableGymPlanRows['sections'] = [];
    const exercises: PersistableGymPlanRows['exercises'] = [];
    const targetSets: PersistableGymPlanRows['targetSets'] = [];

    gymPlan.sections.forEach((section: GymPlanSection, sectionIndex) => {
        sections.push({
            createdAtMs: nowMs,
            gymPlanId: gymPlan.id,
            id: section.id,
            sortIndex: sectionIndex,
            title: section.title ?? null,
            updatedAtMs: nowMs,
        });

        section.exercises.forEach(
            (exercise: GymPlanExercise, exerciseIndex) => {
                exercises.push({
                    createdAtMs: nowMs,
                    exerciseDefinitionId: exercise.exerciseDefinitionId,
                    gymPlanSectionId: section.id,
                    id: exercise.id,
                    notes: exercise.notes ?? null,
                    sortIndex: exerciseIndex,
                    updatedAtMs: nowMs,
                });

                getExerciseTargetSetsForPersistence(exercise).forEach(
                    (targetSet: GymPlanExerciseTargetSet, setIndex) => {
                        targetSets.push({
                            createdAtMs: nowMs,
                            distanceMeters: targetSet.distanceMeters ?? null,
                            durationSec: targetSet.durationSec ?? null,
                            gymPlanExerciseId: exercise.id,
                            id: targetSet.id,
                            reps: targetSet.reps ?? null,
                            setIndex,
                            updatedAtMs: nowMs,
                            weightGrams: targetSet.weightGrams ?? null,
                        });
                    },
                );
            },
        );
    });

    return { exercises, sections, targetSets };
};

export const createGymPlanService = ({
    clock = systemClock,
    exerciseDefinitionService,
    gymPlanRepository,
}: CreateGymPlanServiceArgs): GymPlanService => {
    const getGymPlanOrThrow = (id: string): GymPlan => {
        const gymPlan = gymPlanRepository.getById(id);
        if (!gymPlan) {
            throw createGymError(gymErrors.gymPlanNotFound);
        }

        return gymPlan;
    };

    const persistGymPlanAggregate = (gymPlan: GymPlan): void => {
        assertGymPlanCanBePersisted(gymPlan, exerciseDefinitionService);

        const nowMs = clock.now();
        const existing = gymPlanRepository.getGymPlanRow(gymPlan.id);
        const rows = gymPlanRowsFromAggregate(gymPlan, nowMs);
        const name = gymPlan.name ?? '';
        const persistedName = gymPlan.status === 'draft' ? name : name.trim();

        if (!existing) {
            gymPlanRepository.insertGymPlan({
                createdAtMs: nowMs,
                description: gymPlan.description,
                draftTargetGymPlanId: gymPlan.draftTargetGymPlanId,
                id: gymPlan.id,
                isFavorite: gymPlan.isFavorite,
                name: persistedName,
                status: gymPlan.status,
                updatedAtMs: nowMs,
            });
        } else {
            gymPlanRepository.updateGymPlan({
                description: gymPlan.description,
                draftTargetGymPlanId: gymPlan.draftTargetGymPlanId,
                id: gymPlan.id,
                isFavorite: gymPlan.isFavorite,
                name: persistedName,
                status: gymPlan.status,
                updatedAtMs: nowMs,
            });
        }

        gymPlanRepository.replaceGymPlanSections({
            exercises: rows.exercises,
            gymPlanId: gymPlan.id,
            sections: rows.sections,
            targetSets: rows.targetSets,
        });
    };

    return {
        listGymPlanItems: (input: ListGymPlansInput = {}): GymPlanListItem[] =>
            gymPlanRepository.listGymPlanItems(input),

        getGymPlanById: (id: string): GymPlan | null =>
            gymPlanRepository.getById(id),

        getDraftGymPlan: (): GymPlan | null => gymPlanRepository.getDraft(),

        upsertDraftGymPlan: (gymPlan: GymPlan): void => {
            const draft = gymPlanRepository.getDraft();
            if (draft && draft.id !== gymPlan.id) {
                gymPlanRepository.deleteGymPlan(draft.id);
            }

            persistGymPlanAggregate({
                ...gymPlan,
                draftTargetGymPlanId:
                    gymPlan.draftTargetGymPlanId ?? draft?.draftTargetGymPlanId,
                status: 'draft',
            });
        },

        commitGymPlanDraft: (): GymPlan => {
            const draft = gymPlanRepository.getDraft();
            if (!draft) {
                throw createGymError(gymErrors.gymPlanNotFound);
            }
            assertGymPlanCanBeCommitted(draft, exerciseDefinitionService);

            if (draft.draftTargetGymPlanId) {
                const target = getGymPlanOrThrow(draft.draftTargetGymPlanId);
                gymPlanRepository.deleteGymPlan(draft.id);
                persistGymPlanAggregate({
                    ...draft,
                    id: target.id,
                    createdAtMs: target.createdAtMs,
                    draftTargetGymPlanId: undefined,
                    status:
                        target.status === 'archived' ? 'archived' : 'active',
                });

                return getGymPlanOrThrow(target.id);
            }

            persistGymPlanAggregate({
                ...draft,
                draftTargetGymPlanId: undefined,
                status: 'active',
            });

            return getGymPlanOrThrow(draft.id);
        },

        discardGymPlanDraft: (): void => {
            const draft = gymPlanRepository.getDraft();
            if (draft) {
                gymPlanRepository.deleteGymPlan(draft.id);
            }
        },

        toggleFavorite: (gymPlanId: GymPlan['id']): void => {
            const gymPlan = getGymPlanOrThrow(gymPlanId);

            gymPlanRepository.updateGymPlan({
                id: gymPlanId,
                isFavorite: !gymPlan.isFavorite,
                updatedAtMs: clock.now(),
            });
        },

        archiveGymPlan: (id: string): void => {
            getGymPlanOrThrow(id);

            gymPlanRepository.updateGymPlan({
                id,
                status: 'archived',
                updatedAtMs: clock.now(),
            });
        },

        restoreGymPlan: (id: string): void => {
            getGymPlanOrThrow(id);

            gymPlanRepository.updateGymPlan({
                id,
                status: 'active',
                updatedAtMs: clock.now(),
            });
        },

        deleteGymPlan: (id: string): void => {
            getGymPlanOrThrow(id);
            gymPlanRepository.deleteGymPlan(id);
        },
    };
};
