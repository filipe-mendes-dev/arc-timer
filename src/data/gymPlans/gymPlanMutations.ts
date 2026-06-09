import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import { dbServices } from '@src/db/dbServices';

import { exerciseDefinitionKeys } from '../exerciseDefinitions/exerciseDefinitionKeys';
import { gymPlanKeys } from './gymPlanKeys';
import { gymSessionKeys } from '../gymSessions';

const invalidateGymPlanQueries = async (
    queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> => {
    await queryClient.invalidateQueries({
        queryKey: gymPlanKeys.all,
    });
};

const invalidateDraftGymPlan = async (
    queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> => {
    await queryClient.invalidateQueries({
        queryKey: gymPlanKeys.draft(),
    });
};

export const useUpsertDraftGymPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (gymPlan: GymPlan) => {
            dbServices.gymPlanService.upsertDraftGymPlan(gymPlan);
        },
        onSuccess: async () => {
            await invalidateDraftGymPlan(queryClient);
        },
    });
};

export const useCommitGymPlanDraft = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => dbServices.gymPlanService.commitGymPlanDraft(),
        onSuccess: async () => {
            await Promise.all([
                invalidateGymPlanQueries(queryClient),
                invalidateDraftGymPlan(queryClient),
                queryClient.invalidateQueries({
                    queryKey: exerciseDefinitionKeys.all,
                }),
            ]);
        },
    });
};

export const useDiscardGymPlanDraft = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            dbServices.gymPlanService.discardGymPlanDraft();
        },
        onSuccess: async () => {
            await invalidateDraftGymPlan(queryClient);
        },
    });
};

export const useToggleFavoriteGymPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (gymPlanId: GymPlan['id']) => {
            dbServices.gymPlanService.toggleFavorite(gymPlanId);
        },
        onSuccess: async () => {
            await invalidateGymPlanQueries(queryClient);
        },
    });
};

export const useArchiveGymPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            dbServices.gymPlanService.archiveGymPlan(id);
            return id;
        },
        onSuccess: async () => {
            await invalidateGymPlanQueries(queryClient);
        },
    });
};

export const useRestoreGymPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            dbServices.gymPlanService.restoreGymPlan(id);
            return id;
        },
        onSuccess: async () => {
            await invalidateGymPlanQueries(queryClient);
        },
    });
};

export const useDeleteGymPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            dbServices.gymPlanService.deleteGymPlan(id);
            return id;
        },
        onSuccess: async (id) => {
            queryClient.removeQueries({
                queryKey: gymPlanKeys.detail(id),
            });
            await Promise.all([
                invalidateGymPlanQueries(queryClient),
                queryClient.invalidateQueries({
                    queryKey: exerciseDefinitionKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: gymSessionKeys.all,
                }),
            ]);
        },
    });
};
