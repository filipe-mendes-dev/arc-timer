import { useQuery } from '@tanstack/react-query';

import type { TrainingSessionKind } from '@src/core/entities/trainingSession.interfaces';
import { dbServices } from '@src/db/dbServices';

import { trainingSessionKeys } from './trainingSessionKeys';

export interface UseTrainingSessionListItemsInput {
    kind?: TrainingSessionKind;
    limit?: number;
}

export const useTrainingSessionListItems = ({
    kind,
    limit,
}: UseTrainingSessionListItemsInput = {}) =>
    useQuery({
        queryKey: trainingSessionKeys.listItems(kind, limit),
        queryFn: () =>
            dbServices.trainingSessionService.listItems({ kind, limit }),
        initialData: () =>
            dbServices.trainingSessionService.listItems({ kind, limit }),
    });

export const useRecentTrainingSessions = (limit = 5) =>
    useTrainingSessionListItems({ limit });
