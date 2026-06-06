import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import type { GymPlanListItem } from '@src/core/entities/gymPlan.interfaces';
import {
    useGymPlanListItems,
    useToggleFavoriteGymPlan,
} from '@src/data/gymPlans';

interface UseGymPlansListResult {
    filteredGymPlans: GymPlanListItem[];
    goToPlan: (gymPlanId: string) => void;
    hasSearch: boolean;
    search: string;
    setSearch: (value: string) => void;
    toggleFavoritePlan: (gymPlan: GymPlanListItem) => void;
}

export const useGymPlansList = (): UseGymPlansListResult => {
    const router = useRouter();
    const { data: gymPlans = [] } = useGymPlanListItems();
    const toggleFavorite = useToggleFavoriteGymPlan();
    const [search, setSearch] = useState('');

    const filteredGymPlans = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();
        if (!searchTerm) return gymPlans;

        return gymPlans.filter((gymPlan) =>
            (gymPlan.name ?? '').toLowerCase().includes(searchTerm),
        );
    }, [gymPlans, search]);
    const hasSearch = search.trim().length > 0;

    const goToPlan = useCallback(
        (gymPlanId: string) => {
            router.push(`/gymPlans/${gymPlanId}`);
        },
        [router],
    );

    const toggleFavoritePlan = useCallback(
        (gymPlan: GymPlanListItem) => {
            toggleFavorite.mutate(gymPlan);
        },
        [toggleFavorite],
    );

    return {
        filteredGymPlans,
        goToPlan,
        hasSearch,
        search,
        setSearch,
        toggleFavoritePlan,
    };
};
