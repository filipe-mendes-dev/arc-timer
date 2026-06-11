import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import { useRemoveWorkout } from '@src/data/workouts';
import { useListSelection } from '@src/hooks/useListSelection';
import { useTheme } from '@src/theme/ThemeProvider';

interface UseWorkoutsSelectionResult {
    cancelRemoval: () => void;
    confirmMessage: string;
    confirmRemoval: () => Promise<void>;
    confirmTitle: string;
    errorMessage: string;
    handleCloseError: () => void;
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

export const useWorkoutsSelection = (): UseWorkoutsSelectionResult => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const removeWorkout = useRemoveWorkout();
    const [pendingRemovalIds, setPendingRemovalIds] = useState<string[]>([]);
    const [removalError, setRemovalError] = useState('');

    const {
        isSelectMode,
        selectedCount,
        hasSelection,
        enterSelectMode,
        exitSelectMode,
        toggleItem,
        isSelected,
        selectedIds,
    } = useListSelection();

    const requestRemoval = useCallback((id: string) => {
        setRemovalError('');
        setPendingRemovalIds([id]);
    }, []);

    const requestSelectedRemoval = useCallback(() => {
        setRemovalError('');
        setPendingRemovalIds([...selectedIds]);
    }, [selectedIds]);

    const confirmRemoval = useCallback(async () => {
        setRemovalError('');
        const results = await Promise.allSettled(
            pendingRemovalIds.map((id) => removeWorkout.mutateAsync(id)),
        );
        const failedIds = pendingRemovalIds.filter(
            (_id, index) => results[index].status === 'rejected',
        );

        setPendingRemovalIds(failedIds);
        if (failedIds.length > 0) {
            setRemovalError(t('workouts.errors.deleteFailed'));
            return;
        }

        if (isSelectMode) {
            exitSelectMode();
        }
    }, [exitSelectMode, isSelectMode, pendingRemovalIds, removeWorkout, t]);

    const cancelRemoval = useCallback(() => {
        setRemovalError('');
        setPendingRemovalIds([]);
    }, []);

    const handleCloseError = useCallback(() => {
        setRemovalError('');
        removeWorkout.reset();
    }, [removeWorkout]);

    const topBarOptions = useMemo<readonly TopBarOption[]>(() => {
        return [
            {
                id: 'select',
                label: t('common.selectMode.enter'),
                icon: 'checkmark',
                onPress: enterSelectMode,
            },
        ];
    }, [enterSelectMode, t]);

    let screenTitle = t('workouts.title');
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

    let confirmTitle = t('workouts.confirmRemove.title');
    let confirmMessage = t('workouts.confirmRemove.message');

    if (pendingRemovalIds.length !== 1) {
        confirmTitle = t('workouts.confirmRemoveBulk.title', {
            count: pendingRemovalIds.length,
        });
        confirmMessage = t('workouts.confirmRemoveBulk.message', {
            count: pendingRemovalIds.length,
        });
    }

    return {
        cancelRemoval,
        confirmMessage,
        confirmRemoval,
        confirmTitle,
        errorMessage: removalError,
        handleCloseError,
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
