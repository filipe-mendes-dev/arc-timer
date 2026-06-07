import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import { useDeleteExerciseDefinition } from '@src/data/exerciseDefinitions';
import { useListSelection } from '@src/hooks/useListSelection';
import { useTheme } from '@src/theme/ThemeProvider';

interface UseExerciseDefinitionsSelectionResult {
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

export const useExerciseDefinitionsSelection =
    (): UseExerciseDefinitionsSelectionResult => {
        const { t } = useTranslation();
        const { theme } = useTheme();
        const deleteExerciseDefinition = useDeleteExerciseDefinition();
        const [pendingRemovalIds, setPendingRemovalIds] = useState<string[]>(
            [],
        );
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

        const confirmRemoval = useCallback(() => {
            for (const id of pendingRemovalIds) {
                deleteExerciseDefinition.mutate(id);
            }

            setPendingRemovalIds([]);
            if (isSelectMode) {
                exitSelectMode();
            }
        }, [
            deleteExerciseDefinition,
            exitSelectMode,
            isSelectMode,
            pendingRemovalIds,
        ]);

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

        let screenTitle = t('exerciseDefinitions.title');
        let topBarLeftAction: TopBarDirectAction | undefined;
        let topBarRightAction: TopBarDirectAction | undefined;

        if (isSelectMode) {
            screenTitle = t('common.selectMode.countSelected', {
                count: selectedCount,
            });
            topBarLeftAction = { icon: 'close', onPress: exitSelectMode };

            let removeActionColor = theme.palette.text.secondary;
            if (hasSelection) {
                removeActionColor = theme.palette.icon.error;
            }

            topBarRightAction = {
                icon: 'trash',
                color: removeActionColor,
                disabled: !hasSelection,
                onPress: requestSelectedRemoval,
            };
        }

        let confirmTitle = t('exerciseDefinitions.confirmRemove.title');
        let confirmMessage = t('exerciseDefinitions.confirmRemove.message');

        if (pendingRemovalIds.length !== 1) {
            confirmTitle = t('exerciseDefinitions.confirmRemoveBulk.title', {
                count: pendingRemovalIds.length,
            });
            confirmMessage = t('exerciseDefinitions.confirmRemoveBulk.message', {
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
