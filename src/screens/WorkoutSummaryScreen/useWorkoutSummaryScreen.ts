import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import type { Workout } from '@src/core/entities/workout.interfaces';
import { exportWorkoutToFile } from '@src/core/exportWorkout/exportWorkout';
import {
    formatWorkoutDuration,
    summarizeWorkout,
    type WorkoutSummary,
} from '@core/workouts/summarizeWorkout';
import {
    useRemoveWorkout,
    useToggleFavoriteWorkout,
    useWorkout,
    useWorkoutCurrentVersionId,
} from '@src/data/workouts';
import { useWorkoutRunStore } from '@src/state/stores/useWorkoutRunStore';

interface UseWorkoutSummaryScreenResult {
    confirmRemoveVisible: boolean;
    exportError: string;
    exporting: boolean;
    id: string | undefined;
    isFavorite: boolean;
    summary: WorkoutSummary;
    timeLabel: string;
    topBarOptions: readonly TopBarOption[];
    workout: Workout | undefined;
    closeRemoveConfirm: () => void;
    handleBack: () => void;
    handleEditWorkout: () => void;
    handleExport: () => Promise<void>;
    handleOpenExerciseDefinition: (exerciseDefinitionId: string) => void;
    handleRemoveWorkout: () => void;
    handleStartWorkout: () => void;
    resetExportError: () => void;
    toggleFavoriteWorkout: () => void;
}

export const useWorkoutSummaryScreen = (): UseWorkoutSummaryScreenResult => {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const { data: workout } = useWorkout(id);
    const { data: currentVersionId } = useWorkoutCurrentVersionId(id);
    const removeWorkout = useRemoveWorkout();
    const toggleFavorite = useToggleFavoriteWorkout();
    const [exportError, setExportError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);

    const summary = useMemo(
        () => summarizeWorkout(workout ?? undefined),
        [workout],
    );

    let timeLabel = t('common.status.noTimeEstimate');
    if (summary.approxSec > 0) {
        timeLabel = formatWorkoutDuration(summary.approxSec);
    } else if (summary.hasReps) {
        timeLabel = t('common.status.mixedTimeAndReps');
    }

    const handleBack = () => {
        router.back();
    };

    const openRemoveConfirm = () => {
        setConfirmRemoveVisible(true);
    };

    const closeRemoveConfirm = () => {
        setConfirmRemoveVisible(false);
    };

    const handleOpenExerciseDefinition = (exerciseDefinitionId: string) => {
        router.push(`/exercise-definitions/${exerciseDefinitionId}`);
    };

    const handleEditWorkout = () => {
        if (!id) return;

        router.push({
            pathname: '/workouts/edit',
            params: { id },
        });
    };

    const handleExport = async () => {
        if (!workout || exporting) return;

        setExportError(null);
        setExporting(true);

        const result = await exportWorkoutToFile(workout);

        if (!result.ok) {
            if (result.error === 'SHARING_UNAVAILABLE') {
                setExportError(t('workoutSummary.export.sharingUnavailable'));
            } else if (result.error === 'WRITE_FAILED') {
                setExportError(t('workoutSummary.export.writeFailed'));
            } else {
                setExportError(t('workoutSummary.export.failed'));
            }
        }

        setExporting(false);
    };

    const handleRemoveWorkout = () => {
        if (!workout) return;

        removeWorkout.mutate(workout.id, {
            onSuccess: () => {
                setConfirmRemoveVisible(false);
                router.back();
            },
        });
    };

    const handleStartWorkout = () => {
        if (!id) return;

        useWorkoutRunStore
            .getState()
            .setSourceVersionId(currentVersionId ?? null);
        router.push({
            pathname: `/run/${id}`,
            params: { autoStart: '1' },
        });
    };

    const resetExportError = () => {
        setExportError(null);
    };

    const topBarOptions: readonly TopBarOption[] = [
        {
            id: 'remove-workout',
            label: t('common.actions.remove'),
            icon: 'trash',
            destructive: true,
            onPress: openRemoveConfirm,
        },
    ];

    const toggleFavoriteWorkout = () => {
        if (!workout) return;

        toggleFavorite.mutate(workout);
    };

    return {
        confirmRemoveVisible,
        exportError: exportError ?? '',
        exporting,
        id,
        isFavorite: workout?.isFavorite === true,
        summary,
        timeLabel,
        topBarOptions,
        workout: workout ?? undefined,
        closeRemoveConfirm,
        handleBack,
        handleEditWorkout,
        handleExport,
        handleOpenExerciseDefinition,
        handleRemoveWorkout,
        handleStartWorkout,
        resetExportError,
        toggleFavoriteWorkout,
    };
};
