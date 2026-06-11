import type { ExerciseDefinitionListParams } from '@src/db/services/exerciseDefinitions/exerciseDefinitionServiceFactory';

export const exerciseDefinitionKeys = {
    all: ['exerciseDefinitions'] as const,
    detail: (id?: string) => ['exerciseDefinitions', 'detail', id ?? ''] as const,
    listItems: (params?: ExerciseDefinitionListParams) =>
        ['exerciseDefinitions', 'listItems', params] as const,
};
