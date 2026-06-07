import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { GymExerciseRecord } from '@src/core/entities/gymSession.interfaces';
import { useGymExerciseDefinitions } from '@src/data/exerciseDefinitions';
import { useGymPlan } from '@src/data/gymPlans';
import {
    useActiveGymSession,
    useDeleteGymExerciseRecord,
    useDiscardGymSession,
    useFinishGymSession,
} from '@src/data/gymSessions';
import {
    formatElapsedDuration,
    formatShortTime,
} from '@src/helpers/time.helpers';

const TICK_INTERVAL_MS = 1000;

export const useGymActiveSessionScreen = () => {
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const { data: activeSession } = useActiveGymSession();
    const { data: sourceGymPlan } = useGymPlan(activeSession?.sourceGymPlanId);
    const { data: exerciseDefinitions = [] } = useGymExerciseDefinitions();
    const finishGymSession = useFinishGymSession();
    const discardGymSession = useDiscardGymSession();
    const deleteExerciseRecord = useDeleteGymExerciseRecord();
    const [nowMs, setNowMs] = useState(Date.now());
    const [isEndSessionModalVisible, setEndSessionModalVisible] =
        useState(false);
    const [pendingRemoveRecord, setPendingRemoveRecord] =
        useState<GymExerciseRecord | null>(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNowMs(Date.now());
        }, TICK_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);

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

    const getElapsedDuration = (): string => {
        if (!activeSession) return formatElapsedDuration(0);

        return formatElapsedDuration(nowMs - activeSession.startedAtMs);
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
            onSuccess: () => {
                setEndSessionModalVisible(false);
                router.replace('/gym');
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

    return {
        activeSession,
        elapsedDuration: getElapsedDuration(),
        errorMessage: getErrorMessage(),
        exerciseNameById,
        exerciseRecordCount,
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
        sourceGymPlan,
        startedAtLabel: getStartedAtLabel(),
        t,
    };
};
