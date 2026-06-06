import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useDiscardGymPlanDraft, useDraftGymPlan } from '@src/data/gymPlans';
import { useGymPlanBuilderStore } from '@src/state/stores/useGymPlanBuilderStore';

import { importGymPlanDraftFromFile } from '../GymPlansScreen.import';

interface UseNewGymPlanFlowResult {
    closeNewPlanModal: () => void;
    handleImportFromFile: () => Promise<void>;
    handleNewPlan: () => void;
    handleResumeDraft: () => void;
    hasRecoverableDraft: boolean;
    importError: string;
    isImporting: boolean;
    isNewPlanModalVisible: boolean;
    isStartingDraft: boolean;
    openNewPlanModal: () => void;
    setImportError: (message: string) => void;
}

export const useNewGymPlanFlow = (): UseNewGymPlanFlowResult => {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: recoverableDraft = null } = useDraftGymPlan();
    const discardDraft = useDiscardGymPlanDraft();
    const hydrateDraft = useGymPlanBuilderStore((state) => state.hydrateDraft);
    const startImportedDraft = useGymPlanBuilderStore(
        (state) => state.startImportedDraft,
    );
    const startNewDraft = useGymPlanBuilderStore(
        (state) => state.startNewDraft,
    );
    const [isNewPlanModalVisible, setNewPlanModalVisible] = useState(false);
    const [importError, setImportErrorState] = useState('');
    const [isImporting, setImporting] = useState(false);

    const openNewPlanModal = useCallback(() => {
        setNewPlanModalVisible(true);
    }, []);

    const closeNewPlanModal = useCallback(() => {
        setNewPlanModalVisible(false);
    }, []);

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
        });

        if (result.errorKey) {
            setImportErrorState(t(result.errorKey));
        }

        if (result.didImport) {
            router.push('/gymPlans/edit');
        }

        setImporting(false);
        closeNewPlanModal();
    }, [closeNewPlanModal, isImporting, router, startImportedDraft, t]);

    return {
        closeNewPlanModal,
        handleImportFromFile,
        handleNewPlan,
        handleResumeDraft,
        hasRecoverableDraft: recoverableDraft !== null,
        importError,
        isImporting,
        isNewPlanModalVisible,
        isStartingDraft: discardDraft.isPending,
        openNewPlanModal,
        setImportError: setImportErrorState,
    };
};
