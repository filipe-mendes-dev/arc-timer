import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { TrainingSessionListParams } from '@src/core/entities/trainingSession.interfaces';
import { dbServices } from '@src/db/dbServices';
import { trainingSessionKeys } from './trainingSessionKeys';

export interface UseTrainingSessionListItemsInput extends TrainingSessionListParams {}
export const useTrainingSessionListItems = (
    input: UseTrainingSessionListItemsInput = {},
) =>
    useQuery({
        queryKey: [...trainingSessionKeys.all, 'listItems', input],
        queryFn: () => dbServices.trainingSessionService.listItems(input),
        initialData: () => dbServices.trainingSessionService.listItems(input),
    });

export const useTrainingSessionHistory = (input: TrainingSessionListParams) =>
    useInfiniteQuery({
        queryKey: [...trainingSessionKeys.all, 'history', input],
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            dbServices.trainingSessionService.listItems({
                ...input,
                limit: 30,
                offset: pageParam,
            }),
        getNextPageParam: (lastPage, pages) =>
            lastPage.length === 30 ? pages.length * 30 : undefined,
    });

export const useRecentTrainingSessions = (limit = 5) =>
    useTrainingSessionListItems({ limit });
