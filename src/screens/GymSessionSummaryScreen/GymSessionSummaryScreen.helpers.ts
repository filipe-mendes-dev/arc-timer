import type { TFunction } from 'i18next';

import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import type {
    GymExerciseRecordSet,
    GymSession,
} from '@src/core/entities/gymSession.interfaces';
import { formatCompletedGymDuration } from '@src/core/gyms/formatGymDuration';

import type {
    ExerciseSummary,
    GymSessionMetric,
    SectionSummary,
} from './GymSessionSummaryScreen.interfaces';

export const getMetricTone = (
    metric: GymSessionMetric,
): 'muted' | 'primary' => {
    if (metric.isDimmed) return 'muted';

    return 'primary';
};

const formatWeight = (weightGrams: number): string => {
    const weightKg = weightGrams / 1000;
    return Number.isInteger(weightKg) ? `${weightKg}` : weightKg.toFixed(1);
};

const formatDistance = (distanceMeters: number): string => {
    const distanceKm = distanceMeters / 1000;

    if (Number.isInteger(distanceKm)) {
        return `${distanceKm}`;
    }

    return distanceKm.toFixed(2);
};

const formatDurationMinutes = (durationSec: number): string => {
    const durationMin = Math.round(durationSec / 60);

    if (durationSec > 0 && durationMin < 1) {
        return '1 min';
    }

    if (durationMin < 60) {
        return `${durationMin} min`;
    }

    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    if (minutes === 0) {
        return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
};

const formatRpe = (rpeTenths: number): string => {
    const rpe = rpeTenths / 10;
    return Number.isInteger(rpe) ? `${rpe}` : rpe.toFixed(1);
};

export const getSetDetails = (
    set: GymExerciseRecordSet,
    t: TFunction,
): string => {
    const details: string[] = [];

    if (set.reps !== undefined) {
        details.push(t('gymExerciseData.setDetails.reps', { count: set.reps }));
    }

    if (set.weightGrams !== undefined) {
        details.push(
            t('gymExerciseData.setDetails.weight', {
                value: formatWeight(set.weightGrams),
            }),
        );
    }

    if (set.durationSec !== undefined) {
        details.push(
            t('gymExerciseData.setDetails.duration', {
                value: formatDurationMinutes(set.durationSec),
            }),
        );
    }

    if (set.distanceMeters !== undefined) {
        details.push(
            t('gymExerciseData.setDetails.distance', {
                value: formatDistance(set.distanceMeters),
            }),
        );
    }

    if (set.rpeTenths !== undefined) {
        details.push(
            t('gymExerciseData.setDetails.rpe', {
                value: formatRpe(set.rpeTenths),
            }),
        );
    }

    if (set.notes) {
        details.push(set.notes);
    }

    if (details.length === 0) {
        return t('gymExerciseData.setDetails.empty');
    }

    return details.join(' · ');
};

export const getStartedAtLabel = (
    startedAtMs: number,
    locale: string,
): string => {
    const startedAt = new Date(startedAtMs);

    return (
        startedAt.toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }) +
        ' · ' +
        startedAt.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        })
    );
};

export const getEndedAtLabel = (
    endedAtMs: number | undefined,
    locale: string,
    t: TFunction,
): string => {
    if (endedAtMs === undefined) {
        return t('gymSessionSummary.status.incomplete');
    }

    return new Date(endedAtMs).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getGymSessionMetrics = (
    session: GymSession,
    durationText: string,
    t: TFunction,
): GymSessionMetric[] => [
    {
        key: 'duration',
        label: t('run.stats.duration'),
        value: durationText,
        isDimmed: durationText === '0 min',
    },
    {
        key: 'exercises',
        label: t('run.stats.exercises'),
        value: `${session.exerciseRecords.length}`,
        isDimmed: session.exerciseRecords.length === 0,
    },
];

export const getExerciseSummaries = (
    session: GymSession,
    exerciseNameById: Map<string, string>,
    t: TFunction,
): ExerciseSummary[] =>
    session.exerciseRecords
        .map<ExerciseSummary>((record, index) => ({
            record,
            completedSets: record.sets.filter(
                (set) => set.completedAtMs !== undefined,
            ),
            exerciseName:
                exerciseNameById.get(record.exerciseDefinitionId) ??
                t('common.labels.exerciseWithIndex', {
                    index: index + 1,
                }),
        }))
        .filter((exercise) => exercise.completedSets.length > 0);

export const getSectionSummaries = (
    session: GymSession,
    sourceGymPlan: GymPlan | null | undefined,
    exerciseSummaries: ExerciseSummary[],
    t: TFunction,
): SectionSummary[] => {
    const exerciseSummaryByRecordId = new Map(
        exerciseSummaries.map((exercise) => [exercise.record.id, exercise]),
    );
    const usedRecordIds = new Set<string>();
    const sourceSections = sourceGymPlan?.sections ?? [];
    const sectionSummaries: SectionSummary[] = [];

    sourceSections.forEach((section, sectionIndex) => {
        const sourceExerciseIds = new Set(
            section.exercises.map((exercise) => exercise.id),
        );
        const sectionRecords = session.exerciseRecords
            .filter(
                (record) =>
                    record.sourceGymPlanExerciseId !== undefined &&
                    sourceExerciseIds.has(record.sourceGymPlanExerciseId),
            )
            .map((record) => exerciseSummaryByRecordId.get(record.id))
            .filter((exercise) => exercise !== undefined);

        if (sectionRecords.length === 0) return;

        sectionRecords.forEach((exercise) => {
            usedRecordIds.add(exercise.record.id);
        });

        const completedSetCount = sectionRecords.reduce(
            (total, exercise) => total + exercise.completedSets.length,
            0,
        );
        const setCount = sectionRecords.reduce(
            (total, exercise) => total + exercise.record.sets.length,
            0,
        );
        const trimmedTitle = section.title?.trim();
        let label = t('gymPlanDetails.sectionFallback', {
            index: sectionIndex + 1,
        });

        if (trimmedTitle && trimmedTitle.length > 0) {
            label = trimmedTitle;
        }

        sectionSummaries.push({
            id: section.id,
            label,
            records: sectionRecords,
            exerciseCount: sectionRecords.length,
            setCount,
            completedSetCount,
        });
    });

    const fallbackRecords = exerciseSummaries.filter(
        (exercise) => !usedRecordIds.has(exercise.record.id),
    );

    if (fallbackRecords.length === 0) {
        return sectionSummaries;
    }

    const fallbackIndex = sectionSummaries.length + 1;
    const completedSetCount = fallbackRecords.reduce(
        (total, exercise) => total + exercise.completedSets.length,
        0,
    );
    const setCount = fallbackRecords.reduce(
        (total, exercise) => total + exercise.record.sets.length,
        0,
    );

    sectionSummaries.push({
        id: 'fallback-section',
        label: t('gymPlanDetails.sectionFallback', {
            index: fallbackIndex,
        }),
        records: fallbackRecords,
        exerciseCount: fallbackRecords.length,
        setCount,
        completedSetCount,
    });

    return sectionSummaries;
};

export const getGymSessionDurationText = (session: GymSession): string =>
    formatCompletedGymDuration(session.startedAtMs, session.endedAtMs);
