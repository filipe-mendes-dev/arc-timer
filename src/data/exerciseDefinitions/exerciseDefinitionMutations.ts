import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
    ExerciseDefinitionData,
    ExerciseDefinitionTargetSetData,
    ExerciseTrackingField,
} from '@src/core/entities/exerciseDefinition.interfaces';
import { dbServices } from '@src/db/dbServices';

import { workoutSessionKeys } from '../workoutSessions';
import { workoutKeys } from '../workouts/workoutKeys';
import { exerciseDefinitionKeys } from './exerciseDefinitionKeys';
import { gymSessionKeys } from '../gymSessions';
import { gymPlanKeys } from '../gymPlans';
import { trainingSessionKeys } from '../trainingSessions';

export interface CreateExerciseDefinitionMutationArgs {
    availability?: ExerciseDefinitionAvailability;
    intent: 'create';
    name: string;
}

export interface UpdateExerciseDefinitionChanges {
    availability?: ExerciseDefinitionAvailability;
    name?: string;
}

export interface UpdateExerciseDefinitionMutationArgs {
    changes: UpdateExerciseDefinitionChanges;
    id: string;
    intent: 'update';
}

export interface MergeExerciseDefinitionMutationArgs {
    intent: 'merge';
    sourceId: string;
    targetId: string;
}

export type SaveExerciseDefinitionArgs =
    | CreateExerciseDefinitionMutationArgs
    | UpdateExerciseDefinitionMutationArgs
    | MergeExerciseDefinitionMutationArgs;

export interface FindOrCreateExerciseDefinitionByNameArgs {
    name: string;
}

export interface SaveExerciseDefinitionDataArgs {
    defaultTargetSet?: ExerciseDefinitionTargetSetData;
    defaultTrackingFields: ExerciseTrackingField[];
    exerciseDefinitionId: string;
    notes?: string;
}

export const useSaveExerciseDefinition = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            args: SaveExerciseDefinitionArgs,
        ): Promise<ExerciseDefinition> => {
            switch (args.intent) {
                case 'create':
                    return dbServices.exerciseDefinitionService.createUserExerciseDefinition(
                        {
                            availability: args.availability,
                            name: args.name,
                        },
                    );
                case 'update':
                    return dbServices.exerciseDefinitionService.updateExerciseDefinition(
                        {
                            id: args.id,
                            ...args.changes,
                        },
                    );
                case 'merge':
                    return dbServices.exerciseDefinitionService.mergeExerciseDefinition(
                        {
                            sourceId: args.sourceId,
                            targetId: args.targetId,
                        },
                    );
                default:
                    throw new Error(
                        'Unsupported exercise definition save intent',
                    );
            }
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: exerciseDefinitionKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: workoutKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: workoutSessionKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: gymPlanKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: gymSessionKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: trainingSessionKeys.all,
                }),
            ]);
        },
    });
};

export const useSaveExerciseDefinitionData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            defaultTargetSet,
            defaultTrackingFields,
            exerciseDefinitionId,
            notes,
        }: SaveExerciseDefinitionDataArgs): Promise<ExerciseDefinitionData> =>
            dbServices.exerciseDefinitionService.upsertExerciseDefinitionData({
                defaultTargetSet,
                defaultTrackingFields,
                exerciseDefinitionId,
                notes,
            }),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: exerciseDefinitionKeys.detail(
                    variables.exerciseDefinitionId,
                ),
            });
        },
    });
};

export const useDeleteExerciseDefinition = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string): Promise<string> => {
            dbServices.exerciseDefinitionService.deleteUserExerciseDefinition(
                id,
            );

            return id;
        },
        onSuccess: async (id) => {
            queryClient.removeQueries({
                queryKey: exerciseDefinitionKeys.detail(id),
            });
            await queryClient.invalidateQueries({
                queryKey: exerciseDefinitionKeys.all,
            });
        },
    });
};

export const useFindOrCreateGymExerciseDefinitionByName = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
        }: FindOrCreateExerciseDefinitionByNameArgs): Promise<ExerciseDefinition> => {
            const definition =
                dbServices.exerciseDefinitionService.findOrCreateUserExerciseDefinitionByName(
                    name,
                );

            if (!definition) {
                throw new Error('Exercise name is required');
            }

            return definition;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: exerciseDefinitionKeys.all,
            });
        },
    });
};
