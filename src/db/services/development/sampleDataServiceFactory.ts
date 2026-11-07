import type { Workout } from '@src/core/entities/workout.interfaces';
import { uid } from '@src/core/id';
import { prepareRunData } from '@src/core/timer/timer.plan';
import { createWorkoutRepository, type RepositoryDb } from '../../repositories/workouts/workoutRepositoryFactory';
import { createWorkoutSessionRepository } from '../../repositories/workoutSessions/workoutSessionRepositoryFactory';
import {
    createSampleDataRepository,
    type SampleSessionInput,
} from '../../repositories/development/sampleDataRepositoryFactory';
import { createExerciseDefinitionStatsRepository } from '../../repositories/exerciseDefinitions/exerciseDefinitionStatsRepositoryFactory';
import type { Clock } from '../../repositories/repositoryClock';

export interface LoadSampleDataInput {
    exerciseNames: readonly string[];
    hiitWorkoutNames: readonly string[];
}

export interface SampleDataService {
    loadSampleData: (input: LoadSampleDataInput) => void;
    removeSampleData: () => void;
}

export const createSampleDataService = ({
    db,
    clock,
    isDevelopment,
}: {
    db: RepositoryDb;
    clock: Clock;
    isDevelopment: boolean;
}): SampleDataService => {
    const updateSampleData = (input?: LoadSampleDataInput) => {
        if (!isDevelopment)
            throw new Error(
                'Sample data is available only in the development variant',
            );
        const now = clock.now();
        db.transaction((tx) => {
            const repository = createSampleDataRepository({ db: tx });
            const affectedIds = new Set(repository.listSampleExerciseIds());
            repository.deleteSampleSessions();
            repository.deleteSampleWorkouts();
            repository.deleteUnusedSampleWorkoutVersions();
            if (input) {
                const names = input.exerciseNames;
                const exerciseIds = names.map((name, index) => {
                    const existing = repository.findExercise(
                        name,
                        `dev-sample-exercise-${index}`,
                    );
                    if (existing) return existing.id;
                    const id = `dev-sample-exercise-${index}`;
                    repository.insertDefinition(id, name, now);
                    return id;
                });
                exerciseIds.forEach((id) => affectedIds.add(id));
                for (let index = 0; index < 144; index += 1) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - Math.floor(index / 2) * 3);
                    date.setHours(index % 2 === 0 ? 8 : 18, 0, 0, 0);
                    if (date.getTime() + 3600000 > now)
                        date.setDate(date.getDate() - 1);
                    const startedAtMs = date.getTime();
                    const id = `dev-sample-session-${index}`;
                    const progress = Math.floor((143 - index) / 16);
                    const sessionInput: SampleSessionInput = {
                        session: {
                            id,
                            status: 'completed',
                            startedAtMs,
                            endedAtMs: startedAtMs + 2700000,
                            sourceGymPlanName: names[0],
                            createdAtMs: startedAtMs,
                            updatedAtMs: startedAtMs,
                        },
                        records: [],
                        sets: [],
                    };
                    exerciseIds.forEach((exerciseDefinitionId, exerciseIndex) => {
                        if (exerciseIndex === 3 && index % 12 !== 0) return;
                        const recordId = `${id}-exercise-${exerciseIndex}`;
                        sessionInput.records.push({
                            id: recordId,
                            gymSessionId: id,
                            exerciseDefinitionId,
                            sortIndex: exerciseIndex,
                            startedAtMs,
                            createdAtMs: startedAtMs,
                            updatedAtMs: startedAtMs,
                        });
                        for (let setIndex = 0; setIndex < 4; setIndex += 1) {
                            const isWarmup = setIndex === 0;
                            const hasMeasurement = index % 11 !== 0 || isWarmup;
                            const set: SampleSessionInput['sets'][number] = {
                                id: `${recordId}-set-${setIndex}`,
                                gymExerciseRecordId: recordId,
                                setIndex,
                                isWarmup,
                                completedAtMs:
                                    startedAtMs +
                                    (exerciseIndex * 4 + setIndex + 1) * 60000,
                                createdAtMs: startedAtMs,
                                updatedAtMs: startedAtMs,
                            };
                            if (hasMeasurement && exerciseIndex < 2) {
                                set.reps = 6 + ((index + setIndex) % 5);
                                if (exerciseIndex === 0)
                                    set.weightGrams = isWarmup ? 40000 : 60000 + progress * 2500 - (index % 3) * 1250;
                            }
                            if (hasMeasurement && exerciseIndex >= 2)
                                set.durationSec = 45 + progress * 15;
                            if (hasMeasurement && exerciseIndex === 3)
                                set.distanceMeters = 100 + progress * 25;
                            sessionInput.sets.push(set);
                        }
                    });
                    repository.insertSession(sessionInput);
                }
                const workoutRepository = createWorkoutRepository({ db: tx });
                const sessionRepository = createWorkoutSessionRepository({ db: tx });
                const sampleWorkouts = input.hiitWorkoutNames.map((name, workoutIndex) => {
                    const versionId = `dev-sample-hiit-version-${uid()}`;
                    const workout: Workout = {
                        id: `dev-sample-hiit-workout-${workoutIndex}`,
                        name,
                        updatedAtMs: now,
                        isFavorite: workoutIndex === 0,
                        blockCount: 1,
                        exerciseCount: 3,
                        blocks: [{
                            id: `${versionId}-block`,
                            sets: workoutIndex === 0 ? 3 : 4,
                            restBetweenSetsSec: workoutIndex === 0 ? 45 : 30,
                            restBetweenExercisesSec: workoutIndex === 0 ? 15 : 10,
                            exercises: exerciseIds.slice(1).map((exerciseDefinitionId, exerciseIndex) => ({
                                id: `${versionId}-exercise-${exerciseIndex}`,
                                exerciseDefinitionId,
                                name: names[exerciseIndex + 1],
                                mode: 'time',
                                value: workoutIndex === 0 ? 30 + exerciseIndex * 15 : 20,
                            })),
                        }],
                    };
                    workoutRepository.insertWorkoutVersion(workout, versionId);
                    workoutRepository.insertWorkout({
                        id: workout.id,
                        name,
                        currentVersionId: versionId,
                        createdAtMs: now,
                        isFavorite: workout.isFavorite,
                        sortIndex: workoutIndex,
                    });
                    const { steps, meta } = prepareRunData(workout, 5);
                    const workSteps = steps.filter((step) => step.label === 'WORK');
                    const totalWorkSec = workSteps.reduce((total, step) => total + step.durationSec, 0);
                    const totalRestSec = steps.filter((step) => step.label === 'REST').reduce((total, step) => total + step.durationSec, 0);
                    const totalPrepSec = steps.filter((step) => step.label === 'PREP').reduce((total, step) => total + step.durationSec, 0);
                    return {
                        workout,
                        versionId,
                        totalDurationSec: totalWorkSec + totalRestSec + totalPrepSec,
                        stats: {
                            completedSets: meta.totalSetsForRun,
                            completedExercises: workSteps.length,
                            totalWorkSec,
                            totalRestSec,
                            totalPrepSec,
                            completedSetsByBlock: meta.plannedSetsByBlock,
                            completedExercisesByBlock: [workSteps.length],
                            workSecByBlock: [totalWorkSec],
                            restSecByBlock: [totalRestSec],
                            prepSecByBlock: [totalPrepSec],
                        },
                    };
                });
                for (let index = 0; index < 72; index += 1) {
                    const sample = sampleWorkouts[index % sampleWorkouts.length];
                    const date = new Date(now);
                    date.setDate(date.getDate() - index * 3 - index % 2);
                    date.setHours(12, 0, 0, 0);
                    if (date.getTime() + sample.totalDurationSec * 1000 > now)
                        date.setDate(date.getDate() - 1);
                    const startedAtMs = date.getTime();
                    sessionRepository.insertSession({
                        id: `dev-sample-hiit-session-${index}`,
                        startedAtMs,
                        endedAtMs: startedAtMs + sample.totalDurationSec * 1000,
                        workoutName: sample.workout.name,
                        workoutVersionId: sample.versionId,
                        workoutSnapshot: sample.workout,
                        totalDurationSec: sample.totalDurationSec,
                        stats: sample.stats,
                    });
                }
            }
            createExerciseDefinitionStatsRepository({
                db: tx,
            }).rebuildForExerciseDefinitionIds({
                exerciseDefinitionIds: [...affectedIds],
                updatedAtMs: now,
            });
            repository.deleteUnusedSampleDefinitions();
        });
    };
    return {
        loadSampleData: (input) => {
            if (input.exerciseNames.length !== 4)
                throw new Error('Four sample exercise names are required');
            if (input.hiitWorkoutNames.length !== 2)
                throw new Error('Two sample HIIT workout names are required');
            updateSampleData(input);
        },
        removeSampleData: () => updateSampleData(),
    };
};
