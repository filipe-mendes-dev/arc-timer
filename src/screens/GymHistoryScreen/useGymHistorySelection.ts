import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import { useDeleteGymSession } from '@src/data/gymSessions';
import { useListSelection } from '@src/hooks/useListSelection';
import { useTheme } from '@src/theme/ThemeProvider';

interface UseGymHistorySelectionResult {
    cancelRemoval: () => void;
    confirmMessage: string;
    confirmRemoval: () => void;
    confirmTitle: string;
    hasPendingRemoval: boolean;
    isSelectMode: boolean;
    isSelected: (id: string) => boolean;
    screenTitle: string;
    toggleItem: (id: string) => void;
    topBarLeftAction?: TopBarDirectAction;
    topBarOptions: readonly TopBarOption[];
    topBarRightAction?: TopBarDirectAction;
}

export const useGymHistorySelection = (): UseGymHistorySelectionResult => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const deleteGymSession = useDeleteGymSession();
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

    const requestSelectedRemoval = useCallback(() => {
        setPendingRemovalIds([...selectedIds]);
    }, [selectedIds]);

    const confirmRemoval = useCallback(() => {
        for (const id of pendingRemovalIds) {
            deleteGymSession.mutate(id);
        }

        setPendingRemovalIds([]);
        if (isSelectMode) {
            exitSelectMode();
        }
    }, [deleteGymSession, exitSelectMode, isSelectMode, pendingRemovalIds]);

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

    let screenTitle = t('gymHistory.title');
    let topBarLeftAction: TopBarDirectAction | undefined;
    let topBarRightAction: TopBarDirectAction | undefined;

    if (isSelectMode) {
        screenTitle = t('common.selectMode.countSelected', {
            count: selectedCount,
        });
        topBarLeftAction = { icon: 'close', onPress: exitSelectMode };
        let deleteColor = theme.palette.text.secondary;
        if (hasSelection) {
            deleteColor = theme.palette.icon.error;
        }
        topBarRightAction = {
            icon: 'trash',
            color: deleteColor,
            disabled: !hasSelection,
            onPress: requestSelectedRemoval,
        };
    }

    const confirmTitle = t('gymHistory.confirmRemoveBulk.title', {
        count: pendingRemovalIds.length,
    });
    const confirmMessage = t('gymHistory.confirmRemoveBulk.message', {
        count: pendingRemovalIds.length,
    });

    return {
        cancelRemoval,
        confirmMessage,
        confirmRemoval,
        confirmTitle,
        hasPendingRemoval: pendingRemovalIds.length > 0,
        isSelectMode,
        isSelected,
        screenTitle,
        toggleItem,
        topBarLeftAction,
        topBarOptions,
        topBarRightAction,
    };
};
