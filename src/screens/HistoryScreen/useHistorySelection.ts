import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import type { TrainingSessionKind } from '@src/core/entities/trainingSession.interfaces';
import { useDeleteGymSession } from '@src/data/gymSessions';
import { useRemoveWorkoutSession } from '@src/data/workoutSessions';
import { useListSelection } from '@src/hooks/useListSelection';
import { useTheme } from '@src/theme/ThemeProvider';

interface SelectedTrainingSession {
    id: string;
    kind: TrainingSessionKind;
}

interface PendingTrainingSessionRemoval {
    key: string;
    session: SelectedTrainingSession;
}

interface UseHistorySelectionResult {
    cancelRemoval: () => void;
    confirmMessage: string;
    confirmRemoval: () => Promise<void>;
    confirmTitle: string;
    errorMessage: string;
    handleCloseError: () => void;
    hasPendingRemoval: boolean;
    isSelectMode: boolean;
    isSelected: (id: string) => boolean;
    screenTitle: string;
    toggleItem: (id: string) => void;
    topBarLeftAction?: TopBarDirectAction;
    topBarOptions: readonly TopBarOption[];
    topBarRightAction?: TopBarDirectAction;
}

const parseSelectedTrainingSession = (
    value: string,
): SelectedTrainingSession | null => {
    const separatorIndex = value.indexOf(':');
    if (separatorIndex <= 0) return null;

    const kind = value.slice(0, separatorIndex);
    const id = value.slice(separatorIndex + 1);
    if (id.length === 0) return null;

    if (kind === 'hiit' || kind === 'gym') {
        return { id, kind };
    }

    return null;
};

export const useHistorySelection = (): UseHistorySelectionResult => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const removeWorkoutSession = useRemoveWorkoutSession();
    const deleteGymSession = useDeleteGymSession();
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

    const requestSelectedRemoval = useCallback(() => {
        setRemovalError('');
        setPendingRemovalIds([...selectedIds]);
    }, [selectedIds]);

    const confirmRemoval = useCallback(async () => {
        setRemovalError('');
        const pendingRemovals: PendingTrainingSessionRemoval[] = [];
        const failedIds: string[] = [];

        for (const pendingRemovalId of pendingRemovalIds) {
            const selectedSession =
                parseSelectedTrainingSession(pendingRemovalId);
            if (!selectedSession) {
                failedIds.push(pendingRemovalId);
                continue;
            }

            pendingRemovals.push({
                key: pendingRemovalId,
                session: selectedSession,
            });
        }

        const results = await Promise.allSettled(
            pendingRemovals.map(({ session }) => {
                if (session.kind === 'hiit') {
                    return removeWorkoutSession.mutateAsync(session.id);
                }

                return deleteGymSession.mutateAsync(session.id);
            }),
        );

        pendingRemovals.forEach((removal, index) => {
            if (results[index].status === 'rejected') {
                failedIds.push(removal.key);
            }
        });

        setPendingRemovalIds(failedIds);
        if (failedIds.length > 0) {
            setRemovalError(t('history.errors.deleteFailed'));
            return;
        }

        if (isSelectMode) {
            exitSelectMode();
        }
    }, [
        deleteGymSession,
        exitSelectMode,
        isSelectMode,
        pendingRemovalIds,
        removeWorkoutSession,
        t,
    ]);

    const cancelRemoval = useCallback(() => {
        setRemovalError('');
        setPendingRemovalIds([]);
    }, []);

    const handleCloseError = useCallback(() => {
        setRemovalError('');
        removeWorkoutSession.reset();
        deleteGymSession.reset();
    }, [deleteGymSession, removeWorkoutSession]);

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

    let screenTitle = t('history.title');
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

    let confirmTitle = t('history.confirmRemoveBulk.title', { count: 1 });
    let confirmMessage = t('history.confirmRemoveBulk.message', { count: 1 });

    if (pendingRemovalIds.length !== 1) {
        confirmTitle = t('history.confirmRemoveBulk.title', {
            count: pendingRemovalIds.length,
        });
        confirmMessage = t('history.confirmRemoveBulk.message', {
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
        screenTitle,
        toggleItem,
        topBarLeftAction,
        topBarOptions,
        topBarRightAction,
    };
};
