import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
    isGymError,
    useActiveGymSession,
    useDiscardGymSession,
    useFinishGymSession,
    useStartGymSession,
} from '@src/data/gymSessions';
import { formatShortTime } from '@src/helpers/time.helpers';

export const useGymScreen = () => {
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const { data: activeSession } = useActiveGymSession();
    const startGymSession = useStartGymSession();
    const finishGymSession = useFinishGymSession();
    const discardGymSession = useDiscardGymSession();
    const [isFinishModalVisible, setFinishModalVisible] = useState(false);

    const getErrorMessage = (): string => {
        if (discardGymSession.error) {
            return t('gymActiveSession.errors.discardFailed');
        }

        if (finishGymSession.error) {
            return t('gymActiveSession.errors.finishFailed');
        }

        if (!startGymSession.error) return '';

        if (
            isGymError(startGymSession.error) &&
            startGymSession.error.code === 'ACTIVE_SESSION_EXISTS'
        ) {
            return t('gym.errors.activeSessionExists');
        }

        return t('gym.errors.startFailed');
    };

    const locale = i18n.resolvedLanguage ?? i18n.language;
    const getStartedAtLabel = (): string => {
        if (!activeSession) return '';

        return formatShortTime(activeSession.startedAtMs, locale);
    };

    const handleStartSession = () => {
        if (startGymSession.isPending) return;

        if (activeSession) {
            router.push('/gymSession');
            return;
        }

        startGymSession.mutate(undefined, {
            onSuccess: () => router.push('/gymSession'),
        });
    };

    const handleConfirmFinish = () => {
        finishGymSession.mutate(undefined, {
            onSuccess: () => setFinishModalVisible(false),
        });
    };

    const handleConfirmDiscard = () => {
        if (!activeSession) return;

        discardGymSession.mutate(activeSession.id, {
            onSuccess: () => setFinishModalVisible(false),
        });
    };

    const handleCloseError = () => {
        startGymSession.reset();
        finishGymSession.reset();
        discardGymSession.reset();
    };

    const errorMessage = getErrorMessage();
    const isFinishingSession =
        finishGymSession.isPending || discardGymSession.isPending;
    const startedAtLabel = getStartedAtLabel();
    const activeSessionSetCount =
        activeSession?.exerciseRecords.reduce(
            (total, record) => total + record.sets.length,
            0,
        ) ?? 0;

    return {
        activeSession,
        activeSessionSetCount,
        discardGymSession,
        errorMessage,
        finishGymSession,
        handleCloseError,
        handleConfirmDiscard,
        handleConfirmFinish,
        handleStartSession,
        isFinishModalVisible,
        isFinishingSession,
        router,
        setFinishModalVisible,
        startedAtLabel,
        t,
    };
};
