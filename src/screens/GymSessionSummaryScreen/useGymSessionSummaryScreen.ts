import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';
import { useGymExerciseDefinitions } from '@src/data/exerciseDefinitions';
import { useGymPlan } from '@src/data/gymPlans';
import {
    useDeleteGymSession,
    useGymSession,
    useStartGymSessionFromSessionSnapshot,
} from '@src/data/gymSessions';

import {
    getEndedAtLabel,
    getExerciseSummaries,
    getGymSessionDurationText,
    getGymSessionMetrics,
    getSectionSummaries,
    getSetDetails,
    getStartedAtLabel,
} from './GymSessionSummaryScreen.helpers';

export const useGymSessionSummaryScreen = () => {
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
    const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const { data: session } = useGymSession(sessionId);
    const { data: sourceGymPlan } = useGymPlan(session?.sourceGymPlanId);
    const { data: exerciseDefinitions = [] } = useGymExerciseDefinitions();
    const deleteGymSession = useDeleteGymSession();
    const startSessionFromSnapshot = useStartGymSessionFromSessionSnapshot();
    const locale = i18n.resolvedLanguage ?? i18n.language;
    const sourceGymPlanId =
        sourceGymPlan?.status === 'active' ? sourceGymPlan.id : undefined;
    const canOpenSourceGymPlan = sourceGymPlanId !== undefined;
    const isStartingSession = startSessionFromSnapshot.isPending;
    const actionErrorMessage = t(
        startSessionFromSnapshot.error?.message ?? '',
    );
    const exerciseNameById = new Map(
        exerciseDefinitions.map((definition) => [
            definition.id,
            definition.name,
        ]),
    );

    const handleGetSetDetails = (set: GymExerciseRecordSet): string =>
        getSetDetails(set, t);

    const handleDeleteSession = () => {
        if (!session) return;

        deleteGymSession.mutate(session.id, {
            onSuccess: () => {
                setDeleteConfirmVisible(false);
                router.back();
            },
        });
    };

    const handleOpenGymPlan = () => {
        if (sourceGymPlanId === undefined) return;

        router.push(`/gymPlans/${sourceGymPlanId}`);
    };

    const handleOpenExerciseDefinition = (exerciseDefinitionId: string) => {
        router.push(`/exercise-definitions/${exerciseDefinitionId}`);
    };

    const handleRunAgain = () => {
        if (!session) return;

        startSessionFromSnapshot.mutate(
            { sessionId: session.id },
            { onSuccess: () => router.push('/gymSession') },
        );
    };

    const resetActionError = () => {
        startSessionFromSnapshot.reset();
    };

    if (!session) {
        return {
            actionErrorMessage,
            canOpenSourceGymPlan,
            durationText: '',
            endedAtLabel: '',
            exerciseSummaries: [],
            getSetDetails: handleGetSetDetails,
            handleDeleteSession,
            handleOpenExerciseDefinition,
            handleOpenGymPlan,
            handleRunAgain,
            isDeleteConfirmVisible,
            isStartingSession,
            metricRows: [],
            resetActionError,
            router,
            sectionSummaries: [],
            session,
            setDeleteConfirmVisible,
            sourceGymPlan,
            startedAtLabel: '',
            t,
        };
    }

    const startedAtLabel = getStartedAtLabel(session.startedAtMs, locale);
    const endedAtLabel = getEndedAtLabel(session.endedAtMs, locale, t);
    const durationText = getGymSessionDurationText(session);
    const metrics = getGymSessionMetrics(session, durationText, t);
    const exerciseSummaries = getExerciseSummaries(
        session,
        exerciseNameById,
        t,
    );
    const sectionSummaries = getSectionSummaries(
        session,
        sourceGymPlan,
        exerciseSummaries,
        t,
    );

    return {
        actionErrorMessage,
        canOpenSourceGymPlan,
        durationText,
        endedAtLabel,
        exerciseSummaries,
        getSetDetails: handleGetSetDetails,
        handleDeleteSession,
        handleOpenExerciseDefinition,
        handleOpenGymPlan,
        handleRunAgain,
        isDeleteConfirmVisible,
        isStartingSession,
        metricRows: [metrics],
        resetActionError,
        router,
        sectionSummaries,
        session,
        setDeleteConfirmVisible,
        sourceGymPlan,
        startedAtLabel,
        t,
    };
};
