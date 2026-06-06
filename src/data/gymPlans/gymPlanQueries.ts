import { useQuery } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';

import { gymPlanKeys } from './gymPlanKeys';

export const useGymPlanListItems = (includeArchived = false) =>
    useQuery({
        queryKey: gymPlanKeys.listItems(includeArchived),
        queryFn: () =>
            dbServices.gymPlanService.listGymPlanItems({ includeArchived }),
        initialData: () =>
            dbServices.gymPlanService.listGymPlanItems({ includeArchived }),
    });

export const useGymPlan = (id?: string) =>
    useQuery({
        queryKey: gymPlanKeys.detail(id),
        queryFn: () =>
            id ? dbServices.gymPlanService.getGymPlanById(id) : null,
        enabled: !!id,
        initialData: () =>
            id ? dbServices.gymPlanService.getGymPlanById(id) : null,
    });

export const useDraftGymPlan = () =>
    useQuery({
        queryKey: gymPlanKeys.draft(),
        queryFn: () => dbServices.gymPlanService.getDraftGymPlan(),
        initialData: () => dbServices.gymPlanService.getDraftGymPlan(),
    });
