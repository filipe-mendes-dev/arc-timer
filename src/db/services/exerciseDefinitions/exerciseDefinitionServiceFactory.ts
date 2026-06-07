import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
    ExerciseDefinitionData,
    ExerciseDefinitionListItem,
    ExerciseDefinitionTargetSetData,
    ExerciseTrackingField,
} from '@src/core/entities/exerciseDefinition.interfaces';
import type { Workout } from '@src/core/entities/workout.interfaces';
import { normalizeExerciseDefinitionName } from '@src/core/exercises/normalizeExerciseDefinitionName';
import {
    createExerciseDefinitionError,
    exerciseDefinitionErrors,
} from '../../repositories/exerciseDefinitions/exerciseDefinitionErrors';
import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';
import {
    systemExerciseDefinitions,
    type SystemExerciseDefinitionSeed,
} from '@src/core/exercises/systemExerciseDefinitions';
import { uid } from '@src/core/id';

import type {
    ExerciseDefinitionListParams,
    ExerciseDefinitionRepository,
    UpdateExerciseDefinitionInput as RepositoryUpdateExerciseDefinitionInput,
} from '../../repositories/exerciseDefinitions/exerciseDefinitionRepositoryFactory';
import type { ExerciseDefinitionDataRepository } from '../../repositories/exerciseDefinitions/exerciseDefinitionDataRepositoryFactory';
import type { ExerciseDefinitionStatsRepository } from '../../repositories/exerciseDefinitions/exerciseDefinitionStatsRepositoryFactory';
import { systemClock, type Clock } from '../../repositories/repositoryClock';

export type {
    ExerciseDefinitionListFilters,
    ExerciseDefinitionListPagination,
    ExerciseDefinitionListParams,
    ExerciseDefinitionListScope,
} from '../../repositories/exerciseDefinitions/exerciseDefinitionRepositoryFactory';

export interface CreateUserExerciseDefinitionInput {
    availability?: ExerciseDefinitionAvailability;
    name: string;
}

export interface UpdateExerciseDefinitionInput {
    availability?: ExerciseDefinitionAvailability;
    id: string;
    name?: string;
}

export interface MergeExerciseDefinitionInput {
    sourceId: string;
    targetId: string;
}

export interface UpsertExerciseDefinitionDataInput {
    defaultTargetSet?: ExerciseDefinitionTargetSetData;
    defaultTrackingFields: ExerciseTrackingField[];
    exerciseDefinitionId: string;
    notes?: string;
}

export interface ExerciseDefinitionService {
    createUserExerciseDefinition: (
        input: CreateUserExerciseDefinitionInput,
    ) => ExerciseDefinition;
    deleteUnreferencedUserExerciseDefinitions: (ids: string[]) => void;
    deleteUserExerciseDefinition: (id: string) => void;
    findOrCreateUserExerciseDefinitionByName: (
        name: string,
    ) => ExerciseDefinition | null;
    getById: (id: string) => ExerciseDefinition | null;
    getByNormalizedName: (normalizedName: string) => ExerciseDefinition | null;
    list: (params?: ExerciseDefinitionListParams) => ExerciseDefinitionListItem[];
    mergeExerciseDefinition: (
        input: MergeExerciseDefinitionInput,
    ) => ExerciseDefinition;
    resolveWorkoutExerciseDefinitions: (workout: Workout) => Workout;
    seedSystemDefinitions: () => void;
    updateExerciseDefinition: (
        input: UpdateExerciseDefinitionInput,
    ) => ExerciseDefinition;
    upsertExerciseDefinitionData: (
        input: UpsertExerciseDefinitionDataInput,
    ) => ExerciseDefinitionData;
}

export interface CreateExerciseDefinitionServiceArgs {
    clock?: Clock;
    exerciseDefinitionDataRepository: ExerciseDefinitionDataRepository;
    exerciseDefinitionRepository: ExerciseDefinitionRepository;
    exerciseDefinitionStatsRepository: ExerciseDefinitionStatsRepository;
}

export const createExerciseDefinitionService = ({
    clock = systemClock,
    exerciseDefinitionDataRepository,
    exerciseDefinitionRepository,
    exerciseDefinitionStatsRepository,
}: CreateExerciseDefinitionServiceArgs): ExerciseDefinitionService => {
    const getSystemDefinitionByNormalizedName = (
        normalizedName: string,
    ): SystemExerciseDefinitionSeed | null =>
        systemExerciseDefinitions.find(
            (definition) => definition.normalizedName === normalizedName,
        ) ?? null;

    const seedSystemDefinition = (
        definition: SystemExerciseDefinitionSeed,
    ): void => {
        const nameInput = normalizeExerciseDefinitionName(definition.name);
        const existing = exerciseDefinitionRepository.getByNormalizedName(
            nameInput.normalizedName,
        );

        if (existing) return;

        exerciseDefinitionRepository.create({
            id: uid(),
            name: nameInput.name,
            normalizedName: nameInput.normalizedName,
            source: 'system',
            availability: definition.availability,
            createdAtMs: definition.createdAtMs,
            updatedAtMs: definition.updatedAtMs,
        });
    };

    const promoteSystemDefinitionToUser = (
        definition: ExerciseDefinition,
        availability?: ExerciseDefinitionAvailability,
    ): ExerciseDefinition => {
        if (
            availability === 'gym' &&
            definition.availability !== 'gym' &&
            exerciseDefinitionRepository.hasWorkoutExerciseReferences(
                definition.id,
            )
        ) {
            throw createExerciseDefinitionError(
                exerciseDefinitionErrors.gymOnlyRestricted,
            );
        }

        if (
            availability === 'workout' &&
            definition.availability !== 'workout' &&
            exerciseDefinitionRepository.hasGymPlanExerciseReferences(
                definition.id,
            )
        ) {
            throw createExerciseDefinitionError(
                exerciseDefinitionErrors.workoutOnlyRestricted,
            );
        }

        return exerciseDefinitionRepository.update({
            id: definition.id,
            source: 'user',
            availability,
            updatedAtMs: clock.now(),
        });
    };

    const service: ExerciseDefinitionService = {
        createUserExerciseDefinition: ({
            availability = 'both',
            name,
        }: CreateUserExerciseDefinitionInput): ExerciseDefinition => {
            const nameInput = normalizeExerciseDefinitionName(name);
            const nowMs = clock.now();
            const existing = exerciseDefinitionRepository.getByNormalizedName(
                nameInput.normalizedName,
            );

            if (existing?.source === 'system') {
                return promoteSystemDefinitionToUser(existing, availability);
            }

            return exerciseDefinitionRepository.create({
                id: uid(),
                name: nameInput.name,
                normalizedName: nameInput.normalizedName,
                source: 'user',
                availability,
                createdAtMs: nowMs,
                updatedAtMs: nowMs,
            });
        },

        deleteUserExerciseDefinition: (id: string): void => {
            const existing = exerciseDefinitionRepository.getById(id);
            if (!existing) {
                throw new Error(`Exercise definition ${id} was not found`);
            }

            if (existing.source === 'system') {
                throw createExerciseDefinitionError(
                    exerciseDefinitionErrors.deleteSystemForbidden,
                );
            }

            if (exerciseDefinitionRepository.hasWorkoutExerciseReferences(id)) {
                throw createExerciseDefinitionError(
                    exerciseDefinitionErrors.deleteReferenced,
                );
            }

            if (exerciseDefinitionRepository.hasGymSessionExerciseReferences(id)) {
                throw createExerciseDefinitionError(
                    exerciseDefinitionErrors.deleteReferenced,
                );
            }

            if (exerciseDefinitionRepository.hasGymPlanExerciseReferences(id)) {
                throw createExerciseDefinitionError(
                    exerciseDefinitionErrors.deleteReferenced,
                );
            }

            exerciseDefinitionRepository.deleteById(id);
        },

        deleteUnreferencedUserExerciseDefinitions: (ids: string[]): void => {
            const uniqueIds = [...new Set(ids)];

            uniqueIds.forEach((id) => {
                const existing = exerciseDefinitionRepository.getById(id);
                if (existing?.source !== 'user') return;

                const hasReferences =
                    exerciseDefinitionRepository.hasWorkoutExerciseReferences(
                        id,
                    ) ||
                    exerciseDefinitionRepository.hasGymSessionExerciseReferences(
                        id,
                    ) ||
                    exerciseDefinitionRepository.hasGymPlanExerciseReferences(
                        id,
                    );

                if (!hasReferences) {
                    exerciseDefinitionRepository.deleteById(id);
                }
            });
        },

        findOrCreateUserExerciseDefinitionByName: (
            name: string,
        ): ExerciseDefinition | null => {
            const trimmedName = name.trim();
            const normalizedName = normalizeExerciseName(trimmedName);
            if (normalizedName.length === 0) return null;

            const existing = exerciseDefinitionRepository.getByNormalizedName(
                normalizedName,
            );
            if (existing?.source === 'system') {
                return promoteSystemDefinitionToUser(existing);
            }
            if (existing) return existing;

            return service.createUserExerciseDefinition({
                name: trimmedName,
            });
        },

        list: ({
            filters,
            pagination,
            scope = 'active',
        }: ExerciseDefinitionListParams = {}): ExerciseDefinitionListItem[] =>
            exerciseDefinitionRepository.list({
                filters,
                pagination,
                scope,
            }),

        mergeExerciseDefinition: ({
            sourceId,
            targetId,
        }: MergeExerciseDefinitionInput): ExerciseDefinition => {
            if (sourceId === targetId) {
                throw new Error(
                    `Cannot merge exercise definition ${sourceId} into itself`,
                );
            }

            const source = exerciseDefinitionRepository.getById(sourceId);
            if (!source) {
                throw new Error(
                    `Exercise definition ${sourceId} was not found`,
                );
            }

            const target = exerciseDefinitionRepository.getById(targetId);
            if (!target) {
                throw new Error(
                    `Exercise definition ${targetId} was not found`,
                );
            }

            const hasWorkoutReferences =
                exerciseDefinitionRepository.hasWorkoutExerciseReferences(
                    sourceId,
                );
            if (hasWorkoutReferences && target.availability === 'gym') {
                throw createExerciseDefinitionError(
                    exerciseDefinitionErrors.mergeGymOnlyConflict,
                );
            }
            const hasGymReferences =
                exerciseDefinitionRepository.hasGymPlanExerciseReferences(
                    sourceId,
                ) ||
                exerciseDefinitionRepository.hasGymSessionExerciseReferences(
                    sourceId,
                );
            if (hasGymReferences && target.availability === 'workout') {
                throw createExerciseDefinitionError(
                    exerciseDefinitionErrors.mergeWorkoutOnlyConflict,
                );
            }

            exerciseDefinitionRepository.replaceWorkoutExerciseDefinitionReferences(
                {
                    sourceId,
                    targetId,
                },
            );
            exerciseDefinitionRepository.replaceGymPlanExerciseDefinitionReferences(
                {
                    sourceId,
                    targetId,
                },
            );
            exerciseDefinitionRepository.replaceGymSessionExerciseDefinitionReferences(
                {
                    sourceId,
                    targetId,
                },
            );
            exerciseDefinitionStatsRepository.rebuildForExerciseDefinitionIds({
                exerciseDefinitionIds: [sourceId, targetId],
                updatedAtMs: clock.now(),
            });

            if (source.source === 'user') {
                exerciseDefinitionRepository.deleteById(sourceId);
            }

            const updatedTarget = exerciseDefinitionRepository.getById(targetId);
            if (!updatedTarget) {
                throw new Error(
                    `Exercise definition ${targetId} was not found`,
                );
            }

            return updatedTarget;
        },

        getById: (id: string): ExerciseDefinition | null =>
            exerciseDefinitionRepository.getById(id),

        getByNormalizedName: (
            normalizedName: string,
        ): ExerciseDefinition | null =>
            exerciseDefinitionRepository.getByNormalizedName(normalizedName),

        resolveWorkoutExerciseDefinitions: (workout: Workout): Workout => ({
            ...workout,
            blocks: workout.blocks.map((block) => ({
                ...block,
                exercises: block.exercises.map((exercise) => {
                    const name = exercise.name?.trim();
                    if (exercise.exerciseDefinitionId) {
                        const definition = service.getById(
                            exercise.exerciseDefinitionId,
                        );

                        if (
                            definition &&
                            (!name ||
                                normalizeExerciseName(name) ===
                                    definition.normalizedName)
                        ) {
                            return {
                                ...exercise,
                                name: definition.name,
                                exerciseDefinitionId: definition.id,
                            };
                        }
                    }

                    if (!name || name.length === 0) {
                        return {
                            ...exercise,
                            name: undefined,
                            exerciseDefinitionId: undefined,
                        };
                    }

                    const definition =
                        service.findOrCreateUserExerciseDefinitionByName(name);

                    return {
                        ...exercise,
                        name: definition?.name ?? name,
                        exerciseDefinitionId: definition?.id,
                    };
                }),
            })),
        }),

        seedSystemDefinitions: (): void => {
            systemExerciseDefinitions.forEach(seedSystemDefinition);
        },

        updateExerciseDefinition: ({
            availability,
            id,
            name,
        }: UpdateExerciseDefinitionInput): ExerciseDefinition => {
            let nameInput: ReturnType<typeof normalizeExerciseDefinitionName> | undefined;
            if (name !== undefined) {
                nameInput = normalizeExerciseDefinitionName(name);
            }
            const existing = exerciseDefinitionRepository.getById(id);
            if (!existing) {
                throw new Error(`Exercise definition ${id} was not found`);
            }

            if (
                availability === 'gym' &&
                existing.availability !== 'gym' &&
                exerciseDefinitionRepository.hasWorkoutExerciseReferences(id)
            ) {
                throw createExerciseDefinitionError(
                    exerciseDefinitionErrors.gymOnlyRestricted,
                );
            }

            if (
                availability === 'workout' &&
                existing.availability !== 'workout' &&
                exerciseDefinitionRepository.hasGymPlanExerciseReferences(id)
            ) {
                throw createExerciseDefinitionError(
                    exerciseDefinitionErrors.workoutOnlyRestricted,
                );
            }

            if (existing.source === 'user') {
                return exerciseDefinitionRepository.update({
                    id: existing.id,
                    name: nameInput?.name,
                    normalizedName: nameInput?.normalizedName,
                    availability,
                    updatedAtMs: clock.now(),
                });
            }

            const hasNameChange =
                nameInput !== undefined &&
                existing.normalizedName !== nameInput.normalizedName;
            const hasAvailabilityChange =
                availability !== undefined &&
                existing.availability !== availability;

            if (!hasNameChange && !hasAvailabilityChange) {
                return existing;
            }

            const updateInput: RepositoryUpdateExerciseDefinitionInput = {
                id: existing.id,
                source: 'user',
                availability,
                updatedAtMs: clock.now(),
            };

            if (hasNameChange && nameInput !== undefined) {
                updateInput.name = nameInput.name;
                updateInput.normalizedName = nameInput.normalizedName;
            }

            const updated = exerciseDefinitionRepository.update(updateInput);

            if (hasNameChange) {
                const oldSystemDefinition = getSystemDefinitionByNormalizedName(
                    existing.normalizedName,
                );

                if (oldSystemDefinition) {
                    seedSystemDefinition(oldSystemDefinition);
                }
            }

            return updated;
        },

        upsertExerciseDefinitionData: ({
            defaultTargetSet,
            defaultTrackingFields,
            exerciseDefinitionId,
            notes,
        }: UpsertExerciseDefinitionDataInput): ExerciseDefinitionData => {
            const definition = exerciseDefinitionRepository.getById(
                exerciseDefinitionId,
            );
            if (!definition) {
                throw new Error(
                    `Exercise definition ${exerciseDefinitionId} was not found`,
                );
            }

            if (definition.availability === 'workout') {
                throw new Error(
                    `Exercise definition ${exerciseDefinitionId} is not gym available`,
                );
            }

            return exerciseDefinitionDataRepository.upsert({
                defaultTargetSet,
                defaultTrackingFields,
                exerciseDefinitionId,
                notes,
                updatedAtMs: clock.now(),
            });
        },
    };

    return service;
};
