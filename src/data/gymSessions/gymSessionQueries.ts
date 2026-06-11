import { useQuery } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';

import { gymSessionKeys } from './gymSessionKeys';

export const useActiveGymSession = () =>
    useQuery({
        queryKey: gymSessionKeys.active(),
        queryFn: () => dbServices.gymSessionService.getActiveGymSession(),
        initialData: () => dbServices.gymSessionService.getActiveGymSession(),
    });

export const useGymSessionListItems = () =>
    useQuery({
        queryKey: gymSessionKeys.listItems(),
        queryFn: () =>
            dbServices.gymSessionService.listGymSessionItems({ limit: 100 }),
        initialData: () =>
            dbServices.gymSessionService.listGymSessionItems({ limit: 100 }),
    });

export const useGymSession = (id?: string) =>
    useQuery({
        queryKey: gymSessionKeys.detail(id),
        queryFn: () =>
            id ? dbServices.gymSessionService.getGymSessionById(id) : null,
        enabled: !!id,
        initialData: () =>
            id ? dbServices.gymSessionService.getGymSessionById(id) : null,
    });
