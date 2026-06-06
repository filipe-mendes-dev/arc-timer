import { useMutation, useQueryClient } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';
import type {
    AddSetToExerciseRecordInput,
    StartGymSessionFromPlanInput,
    StartGymSessionFromSessionSnapshotInput,
    UpdateExerciseRecordSetInput,
} from '@src/db/services/gyms/gymSessionServiceFactory';

import { gymPlanKeys } from '../gymPlans/gymPlanKeys';
import { gymSessionKeys } from './gymSessionKeys';

export interface AddGymExerciseRecordByNameInput {
    exerciseDefinitionId?: string;
    name: string;
    sessionId: string;
    startedAtMs?: number;
}

const invalidateGymSessionQueries = async (
    queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> => {
    await queryClient.invalidateQueries({
        queryKey: gymSessionKeys.all,
    });
};

export const useStartGymSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () =>
            dbServices.gymSessionService.startEmptyGymSession(),
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useStartGymSessionFromPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: StartGymSessionFromPlanInput) =>
            dbServices.gymSessionService.startGymSessionFromPlan(input),
        onSuccess: async () => {
            await Promise.all([
                invalidateGymSessionQueries(queryClient),
                queryClient.invalidateQueries({
                    queryKey: gymPlanKeys.all,
                }),
            ]);
        },
    });
};

export const useStartGymSessionFromSessionSnapshot = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: StartGymSessionFromSessionSnapshotInput) =>
            dbServices.gymSessionService.startGymSessionFromSessionSnapshot(
                input,
            ),
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useFinishGymSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => dbServices.gymSessionService.finishGymSession(),
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useDiscardGymSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) =>
            dbServices.gymSessionService.discardGymSession(id),
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useDeleteGymSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            dbServices.gymSessionService.deleteGymSession(id);
            return id;
        },
        onSuccess: async (id) => {
            queryClient.removeQueries({
                queryKey: gymSessionKeys.detail(id),
            });
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useDeleteGymExerciseRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            dbServices.gymSessionService.deleteExerciseRecord(id);
            return id;
        },
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useAddGymExerciseRecordSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: AddSetToExerciseRecordInput) =>
            dbServices.gymSessionService.addSetToExerciseRecord(input),
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useUpdateGymExerciseRecordSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: UpdateExerciseRecordSetInput) =>
            dbServices.gymSessionService.updateExerciseRecordSet(input),
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useDeleteGymExerciseRecordSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            dbServices.gymSessionService.deleteExerciseRecordSet(id);
            return id;
        },
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};

export const useAddGymExerciseRecordByName = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            exerciseDefinitionId,
            name,
            sessionId,
            startedAtMs,
        }: AddGymExerciseRecordByNameInput) => {
            let targetDefinitionId = exerciseDefinitionId;

            if (!targetDefinitionId) {
                const definition =
                    dbServices.exerciseDefinitionService.findOrCreateUserExerciseDefinitionByName(
                        name,
                    );

                if (!definition) {
                    throw new Error('Exercise name is required');
                }

                targetDefinitionId = definition.id;
            }

            return dbServices.gymSessionService.addExerciseRecordToSession({
                exerciseDefinitionId: targetDefinitionId,
                sessionId,
                startedAtMs,
            });
        },
        onSuccess: async () => {
            await invalidateGymSessionQueries(queryClient);
        },
    });
};
