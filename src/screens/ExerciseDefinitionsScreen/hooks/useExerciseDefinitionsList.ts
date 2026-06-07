import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import type { ExerciseDefinitionListItem } from '@src/core/entities/exerciseDefinition.interfaces';
import {
    useExerciseDefinitions,
    type ExerciseDefinitionListParams,
} from '@src/data/exerciseDefinitions';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';

const SEARCH_DEBOUNCE_DELAY_MS = 150;

interface UseExerciseDefinitionsListResult {
    exerciseDefinitions: ExerciseDefinitionListItem[];
    goToExerciseDefinition: (id: string) => void;
    hasSearch: boolean;
    search: string;
    setSearch: (value: string) => void;
}

export const useExerciseDefinitionsList =
    (): UseExerciseDefinitionsListResult => {
        const router = useRouter();
        const [search, setSearch] = useState('');
        const debouncedSearch = useDebouncedValue(
            search.trim(),
            SEARCH_DEBOUNCE_DELAY_MS,
        );
        const listParams = useMemo<ExerciseDefinitionListParams>(
            () => ({
                filters: {
                    name: debouncedSearch,
                },
                scope: 'active',
            }),
            [debouncedSearch],
        );
        const { data: exerciseDefinitions = [] } =
            useExerciseDefinitions(listParams);
        const hasSearch = debouncedSearch.length > 0;

        const goToExerciseDefinition = useCallback(
            (id: string) => {
                router.push(`/exercise-definitions/${id}`);
            },
            [router],
        );

        return {
            exerciseDefinitions,
            goToExerciseDefinition,
            hasSearch,
            search,
            setSearch,
        };
    };
