import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import {
    useDiscardGymPlanDraft,
    useDraftGymPlan,
    useGymPlans,
    useToggleFavoriteGymPlan,
} from '@src/data/gymPlans';
import { useGymPlanBuilderStore } from '@src/state/stores/useGymPlanBuilderStore';

import { importGymPlanDraftFromFile } from './GymPlansScreen.import';

interface UseGymPlansScreenResult {
    closeNewPlanModal: () => void;
    filteredGymPlans: GymPlan[];
    goToPlan: (gymPlanId: string) => void;
    handleImportFromFile: () => Promise<void>;
    handleNewPlan: () => void;
    handleResumeDraft: () => void;
    hasSearch: boolean;
    hasRecoverableDraft: boolean;
    importError: string;
    isImporting: boolean;
    isNewPlanModalVisible: boolean;
    isStartingDraft: boolean;
    openNewPlanModal: () => void;
    search: string;
    setImportError: (message: string) => void;
    setSearch: (value: string) => void;
    t: ReturnType<typeof useTranslation>['t'];
    toggleFavoritePlan: (gymPlan: GymPlan) => void;
}

export const useGymPlansScreen = (): UseGymPlansScreenResult => {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: gymPlans = [] } = useGymPlans();
    const { data: recoverableDraft = null } = useDraftGymPlan();
    const discardDraft = useDiscardGymPlanDraft();
    const hydrateDraft = useGymPlanBuilderStore((state) => state.hydrateDraft);
    const startImportedDraft = useGymPlanBuilderStore(
        (state) => state.startImportedDraft,
    );
    const startNewDraft = useGymPlanBuilderStore((state) => state.startNewDraft);
    const toggleFavorite = useToggleFavoriteGymPlan();
    const [search, setSearch] = useState('');
    const [isNewPlanModalVisible, setNewPlanModalVisible] = useState(false);
    const [importError, setImportErrorState] = useState('');
    const [isImporting, setImporting] = useState(false);

    const filteredGymPlans = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();
        if (!searchTerm) return gymPlans;

        return gymPlans.filter((gymPlan) =>
            gymPlan.name.toLowerCase().includes(searchTerm),
        );
    }, [gymPlans, search]);
    const hasSearch = search.trim().length > 0;

    const openNewPlanModal = useCallback(() => {
        setNewPlanModalVisible(true);
    }, []);

    const closeNewPlanModal = useCallback(() => {
        setNewPlanModalVisible(false);
    }, []);

    const goToPlan = useCallback(
        (gymPlanId: string) => {
            router.push(`/gymPlans/${gymPlanId}`);
        },
        [router],
    );

    const handleNewPlan = useCallback(() => {
        if (discardDraft.isPending) return;

        discardDraft.mutate(undefined, {
            onSuccess: () => {
                startNewDraft();
                closeNewPlanModal();
                router.push('/gymPlans/edit');
            },
        });
    }, [closeNewPlanModal, discardDraft, router, startNewDraft]);

    const handleResumeDraft = useCallback(() => {
        if (!recoverableDraft) return;

        hydrateDraft(recoverableDraft, 'edit');
        closeNewPlanModal();
        router.push('/gymPlans/edit');
    }, [closeNewPlanModal, hydrateDraft, recoverableDraft, router]);

    const handleImportFromFile = useCallback(async () => {
        if (isImporting) return;
        setImportErrorState('');
        setImporting(true);

        const result = await importGymPlanDraftFromFile({
            startImportedDraft: async (gymPlan) => {
                startImportedDraft(gymPlan);
            },
            t,
        });

        if (result.errorMessage) {
            setImportErrorState(result.errorMessage);
        }

        if (result.didImport) {
            router.push('/gymPlans/edit');
        }

        setImporting(false);
        closeNewPlanModal();
    }, [closeNewPlanModal, isImporting, router, startImportedDraft, t]);

    const toggleFavoritePlan = useCallback(
        (gymPlan: GymPlan) => {
            toggleFavorite.mutate(gymPlan);
        },
        [toggleFavorite],
    );

    return {
        closeNewPlanModal,
        filteredGymPlans,
        goToPlan,
        handleImportFromFile,
        handleNewPlan,
        handleResumeDraft,
        hasSearch,
        hasRecoverableDraft: recoverableDraft !== null,
        importError,
        isImporting,
        isNewPlanModalVisible,
        isStartingDraft: discardDraft.isPending,
        openNewPlanModal,
        search,
        setImportError: setImportErrorState,
        setSearch,
        t,
        toggleFavoritePlan,
    };
};
