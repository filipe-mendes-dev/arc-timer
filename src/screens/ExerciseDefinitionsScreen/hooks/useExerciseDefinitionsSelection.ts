import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import type { ExerciseDefinitionDeleteBlockReason } from '@src/core/entities/exerciseDefinition.interfaces';
import {
    isExerciseDefinitionError,
    useDeleteExerciseDefinition,
} from '@src/data/exerciseDefinitions';
import { useListSelection } from '@src/hooks/useListSelection';
import { useTheme } from '@src/theme/ThemeProvider';

interface UseExerciseDefinitionsSelectionResult {
    cancelRemoval: () => void;
    closeLockedInfo: () => void;
    confirmMessage: string;
    confirmRemoval: () => Promise<void>;
    confirmTitle: string;
    hasPendingRemoval: boolean;
    isLockedInfoVisible: boolean;
    isSelectMode: boolean;
    isSelected: (id: string) => boolean;
    lockedInfoMessage: string;
    lockedInfoTitle: string;
    requestLockedInfo: (
        reason: ExerciseDefinitionDeleteBlockReason | undefined,
    ) => void;
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
        const [removalError, setRemovalError] = useState<string | undefined>();
        const [lockedInfoReason, setLockedInfoReason] = useState<
            ExerciseDefinitionDeleteBlockReason | undefined
        >();
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

        const requestRemoval = useCallback(
            (id: string) => {
                setRemovalError(undefined);
                setPendingRemovalIds([id]);
            },
            [],
        );

        const requestSelectedRemoval = useCallback(() => {
            setRemovalError(undefined);
            setPendingRemovalIds([...selectedIds]);
        }, [selectedIds]);

        const confirmRemoval = useCallback(async () => {
            setRemovalError(undefined);
            const results = await Promise.allSettled(
                pendingRemovalIds.map((id) =>
                    deleteExerciseDefinition.mutateAsync(id),
                ),
            );
            const failedIds = pendingRemovalIds.filter(
                (_id, index) => results[index].status === 'rejected',
            );

            if (failedIds.length === 0) {
                setPendingRemovalIds([]);
                if (isSelectMode) {
                    exitSelectMode();
                }
                return;
            }

            setPendingRemovalIds(failedIds);

            const firstFailure = results.find(
                (result) => result.status === 'rejected',
            );
            const reason: unknown =
                firstFailure?.status === 'rejected'
                    ? firstFailure.reason
                    : undefined;

            if (isExerciseDefinitionError(reason)) {
                setRemovalError(t(reason.message));
                return;
            }

            setRemovalError(t('exerciseDefinitions.validation.deleteFailed'));
        }, [
            deleteExerciseDefinition,
            exitSelectMode,
            isSelectMode,
            pendingRemovalIds,
            t,
        ]);

        const cancelRemoval = useCallback(() => {
            setRemovalError(undefined);
            setPendingRemovalIds([]);
        }, []);

        const requestLockedInfo = useCallback(
            (reason: ExerciseDefinitionDeleteBlockReason | undefined) => {
                setLockedInfoReason(reason ?? 'referenced');
            },
            [],
        );

        const closeLockedInfo = useCallback(() => {
            setLockedInfoReason(undefined);
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
        let confirmMessage =
            removalError ?? t('exerciseDefinitions.confirmRemove.message');

        if (pendingRemovalIds.length !== 1) {
            confirmTitle = t('exerciseDefinitions.confirmRemoveBulk.title', {
                count: pendingRemovalIds.length,
            });
            confirmMessage =
                removalError ??
                t('exerciseDefinitions.confirmRemoveBulk.message', {
                    count: pendingRemovalIds.length,
                });
        }

        const lockedInfoTitle = t('exerciseDefinitions.deleteUnavailable.title');
        let lockedInfoMessage = t(
            'exerciseDefinitions.deleteUnavailable.referenced',
        );
        if (lockedInfoReason === 'system') {
            lockedInfoMessage = t('exerciseDefinitions.deleteUnavailable.system');
        }

        return {
            cancelRemoval,
            closeLockedInfo,
            confirmMessage,
            confirmRemoval,
            confirmTitle,
            hasPendingRemoval: pendingRemovalIds.length > 0,
            isLockedInfoVisible: !!lockedInfoReason,
            isSelectMode,
            isSelected,
            lockedInfoMessage,
            lockedInfoTitle,
            requestLockedInfo,
            requestRemoval,
            screenTitle,
            toggleItem,
            topBarLeftAction,
            topBarOptions,
            topBarRightAction,
        };
    };
