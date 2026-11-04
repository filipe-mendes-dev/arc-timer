import type { RepositoryDb } from '../../repositories/workouts/workoutRepositoryFactory';
import {
    createSampleDataRepository,
    type SampleSessionInput,
} from '../../repositories/development/sampleDataRepositoryFactory';
import { createExerciseDefinitionStatsRepository } from '../../repositories/exerciseDefinitions/exerciseDefinitionStatsRepositoryFactory';
import type { Clock } from '../../repositories/repositoryClock';

export interface SampleDataService {
    loadSampleData: (names: readonly string[]) => void;
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
    const updateSampleData = (names?: readonly string[]) => {
        if (!isDevelopment)
            throw new Error(
                'Sample data is available only in the development variant',
            );
        const now = clock.now();
        db.transaction((tx) => {
            const repository = createSampleDataRepository({ db: tx });
            const affectedIds = new Set(repository.listSampleExerciseIds());
            repository.deleteSampleSessions();
            if (names) {
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
                    const input: SampleSessionInput = {
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
                        input.records.push({
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
                            input.sets.push(set);
                        }
                    });
                    repository.insertSession(input);
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
        loadSampleData: (names) => {
            if (names.length !== 4)
                throw new Error('Four sample exercise names are required');
            updateSampleData(names);
        },
        removeSampleData: () => updateSampleData(),
    };
};
