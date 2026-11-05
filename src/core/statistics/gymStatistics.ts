import type { TrainingSessionListItem } from '../entities/trainingSession.interfaces';

export type StatisticsPeriod = 'month' | 'threeMonths' | 'year' | 'all';
export type ExerciseProgressMetric =
    | 'weight'
    | 'reps'
    | 'volume'
    | 'duration'
    | 'distance';

export interface StatisticsPeriodSelection {
    period: StatisticsPeriod;
}

export interface StatisticsRange {
    startedAtMs?: number;
    endedBeforeMs: number;
}

export interface ExerciseProgressPoint {
    session: TrainingSessionListItem;
    workingSetCount: number;
    weight: number | null;
    weightReps: number | null;
    reps: number | null;
    volume: number | null;
    duration: number | null;
    distance: number | null;
}

export interface GymExerciseStatistics {
    id: string;
    name: string;
    sessionCount: number;
    workingSetCount: number;
    totalReps: number | null;
    lastTrainedAtMs: number;
    points: ExerciseProgressPoint[];
}

export interface TrainingAttendance {
    trainingDayCount: number;
    sessions: TrainingSessionListItem[];
}

export interface ExerciseUsage {
    id: string;
    sessionCount: number;
    lastUsedAtMs: number;
}

export interface GymStatistics extends TrainingAttendance {
    exercises: GymExerciseStatistics[];
}

export const getLocalDayStart = (timestamp: number): number => {
    const date = new Date(timestamp);
    return date.setHours(0, 0, 0, 0);
};

export const getStatisticsRange = (
    period: StatisticsPeriod,
    now: number,
): StatisticsRange => {
    const date = new Date(now);
    let startedAtMs: number | undefined;
    if (period === 'month') {
        startedAtMs = new Date(
            date.getFullYear(),
            date.getMonth(),
            1,
        ).getTime();
    }
    if (period === 'threeMonths') {
        startedAtMs = new Date(
            date.getFullYear(),
            date.getMonth() - 2,
            1,
        ).getTime();
    }
    if (period === 'year')
        startedAtMs = new Date(date.getFullYear(), 0, 1).getTime();
    return { startedAtMs, endedBeforeMs: now + 1 };
};
