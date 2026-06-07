import { useQuery } from '@tanstack/react-query';

import type { ExerciseDefinitionListItem } from '@src/core/entities/exerciseDefinition.interfaces';
import { dbServices } from '@src/db/dbServices';
import type { ExerciseDefinitionListParams } from '@src/db/services/exerciseDefinitions/exerciseDefinitionServiceFactory';

import { exerciseDefinitionKeys } from './exerciseDefinitionKeys';

interface UseExerciseDefinitionsOptions {
    enabled?: boolean;
}

export const useExerciseDefinitions = (
    params?: ExerciseDefinitionListParams,
    options: UseExerciseDefinitionsOptions = {},
) =>
    useQuery({
        queryKey: exerciseDefinitionKeys.listItems(params),
        queryFn: () => dbServices.exerciseDefinitionService.list(params),
        enabled: options.enabled ?? true,
        initialData: (): ExerciseDefinitionListItem[] => {
            if (options.enabled === false) return [];

            return dbServices.exerciseDefinitionService.list(params);
        },
    });

export const useGymExerciseDefinitions = (name?: string) =>
    useExerciseDefinitions({
        filters: {
            availability: 'gym',
            name,
        },
        scope: 'all',
    });

export const useExerciseDefinition = (id?: string) =>
    useQuery({
        queryKey: exerciseDefinitionKeys.detail(id),
        queryFn: () =>
            id ? dbServices.exerciseDefinitionService.getById(id) : null,
        enabled: !!id,
        initialData: () =>
            id ? dbServices.exerciseDefinitionService.getById(id) : null,
    });
