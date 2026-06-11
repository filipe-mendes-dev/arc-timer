import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import { useDeleteGymPlan } from '@src/data/gymPlans';
import { useListSelection } from '@src/hooks/useListSelection';
import { useTheme } from '@src/theme/ThemeProvider';

interface UseGymPlansSelectionResult {
    cancelRemoval: () => void;
    confirmMessage: string;
    confirmRemoval: () => void;
    confirmTitle: string;
    hasPendingRemoval: boolean;
    isSelectMode: boolean;
    isSelected: (id: string) => boolean;
    requestRemoval: (id: string) => void;
    screenTitle: string;
    toggleItem: (id: string) => void;
    topBarLeftAction?: TopBarDirectAction;
    topBarOptions: readonly TopBarOption[];
    topBarRightAction?: TopBarDirectAction;
}

export const useGymPlansSelection = (): UseGymPlansSelectionResult => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const deleteGymPlan = useDeleteGymPlan();
    const [pendingRemovalIds, setPendingRemovalIds] = useState<string[]>([]);
    const {
        enterSelectMode,
        exitSelectMode,
        hasSelection,
        isSelectMode,
        isSelected,
        selectedCount,
        selectedIds,
        toggleItem,
    } = useListSelection();

    const requestRemoval = useCallback((id: string) => {
        setPendingRemovalIds([id]);
    }, []);

    const requestSelectedRemoval = useCallback(() => {
        setPendingRemovalIds([...selectedIds]);
    }, [selectedIds]);

    const confirmRemoval = useCallback(async () => {
        const results = await Promise.allSettled(
            pendingRemovalIds.map((id) => deleteGymPlan.mutateAsync(id)),
        );
        const failedIds = pendingRemovalIds.filter(
            (_id, index) => results[index].status === 'rejected',
        );

        setPendingRemovalIds(failedIds);
        if (isSelectMode && failedIds.length === 0) {
            exitSelectMode();
        }
    }, [deleteGymPlan, exitSelectMode, isSelectMode, pendingRemovalIds]);

    const cancelRemoval = useCallback(() => {
        setPendingRemovalIds([]);
    }, []);

    const topBarOptions = useMemo<readonly TopBarOption[]>(
        () => [
            {
                id: 'select',
                label: t('common.selectMode.enter'),
                icon: 'checkmark',
                onPress: enterSelectMode,
            },
        ],
        [enterSelectMode, t],
    );

    let screenTitle = t('gymPlans.title');
    let topBarLeftAction: TopBarDirectAction | undefined;
    let topBarRightAction: TopBarDirectAction | undefined;

    if (isSelectMode) {
        screenTitle = t('common.selectMode.countSelected', {
            count: selectedCount,
        });
        topBarLeftAction = { icon: 'close', onPress: exitSelectMode };
        topBarRightAction = {
            icon: 'trash',
            color: hasSelection
                ? theme.palette.icon.error
                : theme.palette.text.secondary,
            disabled: !hasSelection,
            onPress: requestSelectedRemoval,
        };
    }

    let confirmTitle = t('gymPlans.confirmRemove.title');
    let confirmMessage = t('gymPlans.confirmRemove.message');

    if (pendingRemovalIds.length !== 1) {
        confirmTitle = t('gymPlans.confirmRemoveBulk.title', {
            count: pendingRemovalIds.length,
        });
        confirmMessage = t('gymPlans.confirmRemoveBulk.message', {
            count: pendingRemovalIds.length,
        });
    }

    return {
        cancelRemoval,
        confirmMessage,
        confirmRemoval,
        confirmTitle,
        hasPendingRemoval: pendingRemovalIds.length > 0,
        isSelectMode,
        isSelected,
        requestRemoval,
        screenTitle,
        toggleItem,
        topBarLeftAction,
        topBarOptions,
        topBarRightAction,
    };
};
