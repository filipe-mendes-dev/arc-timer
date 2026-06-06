import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import { exportGymPlanToFile } from '@src/core/exportGymPlan/exportGymPlan';
import {
    useArchiveGymPlan,
    useDeleteGymPlan,
    useGymPlan,
    useRestoreGymPlan,
    useStartGymSessionFromPlan,
    useToggleFavoriteGymPlan,
} from '@src/data/gymPlans';
import { useGymExerciseDefinitions } from '@src/data/gymSessions';
import { useGymPlanBuilderStore } from '@src/state/stores/useGymPlanBuilderStore';

import {
    getExerciseCount,
    getTargetSetCount,
} from './GymPlanDetailsScreen.helpers';

interface UseGymPlanDetailsScreenResult {
    definitionNameById: ReadonlyMap<string, string>;
    errorMessage: string;
    exportError: string | null;
    gymPlan: GymPlan | undefined;
    hasArchivedStatus: boolean;
    id: string | undefined;
    isDeleteConfirmVisible: boolean;
    isExporting: boolean;
    isFavorite: boolean;
    isStartingSession: boolean;
    sectionCount: number;
    targetSetCount: number;
    topBarOptions: readonly TopBarOption[];
    exerciseCount: number;
    closeDeleteConfirm: () => void;
    confirmDeleteGymPlan: () => void;
    dismissExportError: () => void;
    goBack: () => void;
    handleEditPlan: () => void;
    handleExport: () => Promise<void>;
    handleStartPlan: () => void;
    toggleFavoritePlan: () => void;
}

export const useGymPlanDetailsScreen = (): UseGymPlanDetailsScreenResult => {
    const { t } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { data: loadedGymPlan } = useGymPlan(id);
    const gymPlan = loadedGymPlan ?? undefined;
    const { data: definitions = [] } = useGymExerciseDefinitions();
    const startEditDraft = useGymPlanBuilderStore(
        (state) => state.startEditDraft,
    );
    const startSession = useStartGymSessionFromPlan();
    const toggleFavorite = useToggleFavoriteGymPlan();
    const archiveGymPlan = useArchiveGymPlan();
    const restoreGymPlan = useRestoreGymPlan();
    const deleteGymPlan = useDeleteGymPlan();
    const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [isExporting, setExporting] = useState(false);

    const definitionNameById = useMemo(
        () =>
            new Map(
                definitions.map((definition) => [
                    definition.id,
                    definition.name,
                ]),
            ),
        [definitions],
    );

    const hasArchivedStatus = gymPlan?.status === 'archived';
    const isFavorite = gymPlan?.isFavorite === true;
    const sectionCount = gymPlan?.sections.length ?? 0;
    const exerciseCount = gymPlan ? getExerciseCount(gymPlan) : 0;
    const targetSetCount = gymPlan ? getTargetSetCount(gymPlan) : 0;

    const closeDeleteConfirm = () => {
        setDeleteConfirmVisible(false);
    };

    const toggleFavoritePlan = () => {
        if (!gymPlan) return;

        toggleFavorite.mutate(gymPlan);
    };

    const handleStartPlan = () => {
        if (!gymPlan) return;

        startSession.mutate(
            { gymPlanId: gymPlan.id },
            { onSuccess: () => router.push('/gymSession') },
        );
    };

    const handleEditPlan = () => {
        if (!gymPlan) return;

        startEditDraft(gymPlan);
        router.push('/gymPlans/edit');
    };

    const handleExport = async () => {
        if (!gymPlan || isExporting) return;

        setExportError(null);
        setExporting(true);

        const result = await exportGymPlanToFile(gymPlan);

        if (!result.ok) {
            if (result.error === 'SHARING_UNAVAILABLE') {
                setExportError(
                    t('gymPlanDetails.export.sharingUnavailable'),
                );
            } else if (result.error === 'WRITE_FAILED') {
                setExportError(t('gymPlanDetails.export.writeFailed'));
            } else {
                setExportError(t('gymPlanDetails.export.failed'));
            }
        }

        setExporting(false);
    };

    const confirmDeleteGymPlan = () => {
        if (!gymPlan) return;

        deleteGymPlan.mutate(gymPlan.id, {
            onSuccess: () => router.back(),
        });
    };

    const topBarOptions = useMemo<readonly TopBarOption[]>(() => {
        if (!gymPlan) return [];

        let archiveLabel = t('gymPlanDetails.actions.archive');
        let archiveIcon: TopBarOption['icon'] = 'trash';

        if (hasArchivedStatus) {
            archiveLabel = t('gymPlanDetails.actions.restore');
            archiveIcon = 'checkmarkCircle';
        }

        return [
            {
                id: 'archive-toggle',
                label: archiveLabel,
                icon: archiveIcon,
                destructive: !hasArchivedStatus,
                onPress: () => {
                    if (hasArchivedStatus) {
                        restoreGymPlan.mutate(gymPlan.id);
                        return;
                    }

                    archiveGymPlan.mutate(gymPlan.id);
                },
            },
            {
                id: 'delete-plan',
                label: t('gymPlanDetails.actions.delete'),
                icon: 'trash',
                destructive: true,
                onPress: () => setDeleteConfirmVisible(true),
            },
        ];
    }, [archiveGymPlan, gymPlan, hasArchivedStatus, restoreGymPlan, t]);

    let errorMessage = '';
    if (startSession.error) {
        errorMessage = t('gymPlanDetails.errors.actionFailed');
    }

    const dismissExportError = () => {
        setExportError(null);
    };

    const goBack = () => {
        router.back();
    };

    return {
        definitionNameById,
        errorMessage,
        exportError,
        gymPlan,
        hasArchivedStatus,
        id,
        isDeleteConfirmVisible,
        isExporting,
        isFavorite,
        isStartingSession: startSession.isPending,
        sectionCount,
        targetSetCount,
        topBarOptions,
        exerciseCount,
        closeDeleteConfirm,
        confirmDeleteGymPlan,
        dismissExportError,
        goBack,
        handleEditPlan,
        handleExport,
        handleStartPlan,
        toggleFavoritePlan,
    };
};
