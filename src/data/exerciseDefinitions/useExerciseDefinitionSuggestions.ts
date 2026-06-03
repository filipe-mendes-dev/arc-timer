import { useMemo } from 'react';

import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import type { ExerciseDefinitionListParams } from '@src/db/services/exerciseDefinitions/exerciseDefinitionServiceFactory';
import type { ExerciseDefinitionAvailability } from '@src/core/entities/entities';

import { useExerciseDefinitions } from './exerciseDefinitionQueries';

const DEBOUNCE_DELAY_MS = 150;
const QUERY_LIMIT = 25;
const DISPLAY_LIMIT = 6;

interface UseExerciseDefinitionSuggestionsOptions {
    availability?: ExerciseDefinitionAvailability;
}

export const useExerciseDefinitionSuggestions = (
    input: string,
    { availability = 'workout' }: UseExerciseDefinitionSuggestionsOptions = {},
) => {
    const trimmedInput = input.trim();
    const debouncedInput = useDebouncedValue(trimmedInput, DEBOUNCE_DELAY_MS);
    const hasQuery = debouncedInput.length > 0;

    const params = useMemo<ExerciseDefinitionListParams>(
        () => ({
            filters: {
                availability,
                namePrefix: debouncedInput,
            },
            pagination: {
                limit: QUERY_LIMIT,
            },
            scope: 'all',
        }),
        [availability, debouncedInput],
    );

    const { data = [] } = useExerciseDefinitions(params, {
        enabled: hasQuery,
    });

    return useMemo(
        () => (hasQuery ? data.slice(0, DISPLAY_LIMIT) : []),
        [data, hasQuery],
    );
};
