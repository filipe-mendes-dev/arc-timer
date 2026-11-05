import type { TrainingSessionListItem } from '@src/core/entities/trainingSession.interfaces';
import {
    getLocalDayStart,
    type ExerciseProgressPoint,
    type GymExerciseStatistics,
    type GymStatistics,
    type StatisticsRange,
} from '@src/core/statistics/gymStatistics';
import type { GymStatisticsRepository } from '../../repositories/statistics/gymStatisticsRepositoryFactory';

export interface GymStatisticsService {
    getStatistics: (
        range: StatisticsRange,
        exerciseDefinitionId?: string,
    ) => GymStatistics;
}

export const createGymStatisticsService = ({
    repository,
}: {
    repository: GymStatisticsRepository;
}): GymStatisticsService => ({
    getStatistics: (range, exerciseDefinitionId) => {
        const rows = repository.listCompletedSets(range, exerciseDefinitionId);
        const sessions = new Map<string, TrainingSessionListItem>();
        const sessionExercises = new Map<string, Set<string>>();
        const exercises = new Map<string, GymExerciseStatistics>();
        const exercisePoints = new Map<string, Map<string, ExerciseProgressPoint>>();

        rows.forEach((row) => {
            let session = sessions.get(row.sessionId);
            if (!session) {
                session = {
                    id: row.sessionId,
                    kind: 'gym',
                    title: row.sessionName ?? '',
                    startedAtMs: row.startedAtMs,
                    endedAtMs: row.endedAtMs ?? undefined,
                    primaryMetric: '0',
                    secondaryMetric: '0',
                    searchText: row.sessionName ?? '',
                };
                sessions.set(row.sessionId, session);
                sessionExercises.set(row.sessionId, new Set());
            }
            const includedExercises = sessionExercises.get(row.sessionId);
            includedExercises?.add(row.exerciseDefinitionId);
            session.primaryMetric = String(includedExercises?.size ?? 0);
            session.secondaryMetric = String(Number(session.secondaryMetric) + 1);

            let exercise = exercises.get(row.exerciseDefinitionId);
            if (!exercise) {
                exercise = {
                    id: row.exerciseDefinitionId,
                    name: row.exerciseName,
                    sessionCount: 0,
                    workingSetCount: 0,
                    totalReps: null,
                    lastTrainedAtMs: row.startedAtMs,
                    points: [],
                };
                exercises.set(row.exerciseDefinitionId, exercise);
                exercisePoints.set(row.exerciseDefinitionId, new Map());
            }
            const points = exercisePoints.get(row.exerciseDefinitionId);
            let point = points?.get(row.sessionId);
            if (!point) {
                point = {
                    session,
                    workingSetCount: 0,
                    weight: null,
                    weightReps: null,
                    reps: null,
                    volume: null,
                    duration: null,
                    distance: null,
                };
                points?.set(row.sessionId, point);
                exercise.points.push(point);
                exercise.sessionCount += 1;
            }
            exercise.lastTrainedAtMs = Math.max(
                exercise.lastTrainedAtMs,
                row.startedAtMs,
            );
            if (row.isWarmup) return;

            exercise.workingSetCount += 1;
            point.workingSetCount += 1;
            if (row.reps !== null) {
                exercise.totalReps = (exercise.totalReps ?? 0) + row.reps;
                point.reps = (point.reps ?? 0) + row.reps;
            }
            if (row.weightGrams !== null) {
                const weight = row.weightGrams / 1000;
                if (
                    point.weight === null ||
                    weight > point.weight ||
                    (weight === point.weight &&
                        (row.reps ?? -1) > (point.weightReps ?? -1))
                ) {
                    point.weight = weight;
                    point.weightReps = row.reps;
                }
                if (row.reps !== null) {
                    point.volume = (point.volume ?? 0) + weight * row.reps;
                }
            }
            if (row.durationSec !== null)
                point.duration = (point.duration ?? 0) + row.durationSec;
            if (row.distanceMeters !== null)
                point.distance = (point.distance ?? 0) + row.distanceMeters;
        });

        const sessionItems = [...sessions.values()].reverse();
        return {
            trainingDayCount: new Set(
                sessionItems.map((session) => getLocalDayStart(session.startedAtMs)),
            ).size,
            sessions: sessionItems,
            exercises: [...exercises.values()].sort(
                (left, right) =>
                    right.lastTrainedAtMs - left.lastTrainedAtMs ||
                    left.name.localeCompare(right.name),
            ),
        };
    },
});
