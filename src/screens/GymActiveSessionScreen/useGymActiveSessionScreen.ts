import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { GymExerciseRecord } from '@src/core/entities/gymSession.interfaces';
import { useGymExerciseDefinitions } from '@src/data/exerciseDefinitions';
import {
    useActiveGymSession,
    useDeleteGymExerciseRecord,
    useDiscardGymSession,
    useFinishGymSession,
} from '@src/data/gymSessions';
import { formatShortTime } from '@src/helpers/time.helpers';
import { useElapsedDuration } from '@src/hooks/useElapsedDuration';

export const useGymActiveSessionScreen = () => {
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const { data: activeSession } = useActiveGymSession();
    const { data: exerciseDefinitions = [] } = useGymExerciseDefinitions();
    const finishGymSession = useFinishGymSession();
    const discardGymSession = useDiscardGymSession();
    const deleteExerciseRecord = useDeleteGymExerciseRecord();
    const [isEndSessionModalVisible, setEndSessionModalVisible] =
        useState(false);
    const [pendingRemoveRecord, setPendingRemoveRecord] =
        useState<GymExerciseRecord | null>(null);
    const elapsedDuration = useElapsedDuration(activeSession?.startedAtMs);

    const exerciseNameById = useMemo(
        () =>
            new Map(
                exerciseDefinitions.map((definition) => [
                    definition.id,
                    definition.name,
                ]),
            ),
        [exerciseDefinitions],
    );

    const getErrorMessage = (): string => {
        if (deleteExerciseRecord.error) {
            return t('gymActiveSession.errors.removeExerciseFailed');
        }

        if (discardGymSession.error) {
            return t('gymActiveSession.errors.discardFailed');
        }

        if (finishGymSession.error) {
            return t('gymActiveSession.errors.finishFailed');
        }

        return '';
    };

    const getStartedAtLabel = (): string => {
        if (!activeSession) return '';

        const locale = i18n.resolvedLanguage ?? i18n.language;
        return formatShortTime(activeSession.startedAtMs, locale);
    };

    const handleBackToGym = () => {
        router.replace('/gym');
    };

    const handleBack = () => {
        router.back();
    };

    const handleAddExercise = () => {
        router.push('/gymExerciseAdd');
    };

    const handleOpenExercise = (recordId: string) => {
        router.push(`/gymExerciseData/${recordId}`);
    };

    const handleConfirmFinish = () => {
        finishGymSession.mutate(undefined, {
            onSuccess: (session) => {
                setEndSessionModalVisible(false);
                router.replace(`/gymHistory/${session.id}`);
            },
        });
    };

    const handleConfirmDiscard = () => {
        if (!activeSession) return;

        discardGymSession.mutate(activeSession.id, {
            onSuccess: () => {
                setEndSessionModalVisible(false);
                router.replace('/gym');
            },
        });
    };

    const handleConfirmRemoveExercise = () => {
        if (!pendingRemoveRecord) return;

        deleteExerciseRecord.mutate(pendingRemoveRecord.id, {
            onSuccess: () => setPendingRemoveRecord(null),
        });
    };

    const handleCloseError = () => {
        finishGymSession.reset();
        discardGymSession.reset();
        deleteExerciseRecord.reset();
    };

    const exerciseRecordCount = activeSession?.exerciseRecords.length ?? 0;
    const setCount =
        activeSession?.exerciseRecords.reduce(
            (total, record) => total + record.sets.length,
            0,
        ) ?? 0;
    const hasCompletedSet =
        activeSession?.exerciseRecords.some((record) =>
            record.sets.some((set) => set.completedAtMs !== undefined),
        ) ?? false;

    return {
        activeSession,
        elapsedDuration,
        errorMessage: getErrorMessage(),
        exerciseNameById,
        exerciseRecordCount,
        hasCompletedSet,
        handleAddExercise,
        handleBack,
        handleBackToGym,
        handleCloseError,
        handleConfirmDiscard,
        handleConfirmFinish,
        handleConfirmRemoveExercise,
        handleOpenExercise,
        isDiscardingSession: discardGymSession.isPending,
        isEndSessionModalVisible,
        isFinishingSession: finishGymSession.isPending,
        pendingRemoveRecord,
        setCount,
        setEndSessionModalVisible,
        setPendingRemoveRecord,
        startedAtLabel: getStartedAtLabel(),
        t,
    };
};
