import type {
    TrainingSessionListItem,
    TrainingSessionListParams,
} from '@src/core/entities/trainingSession.interfaces';
import type { TrainingSessionRepository } from '../../repositories/trainingSessions/trainingSessionRepositoryFactory';

export interface ListTrainingSessionsInput extends TrainingSessionListParams {}
export interface TrainingSessionService {
    listItems: (input?: ListTrainingSessionsInput) => TrainingSessionListItem[];
}
export interface CreateTrainingSessionServiceArgs {
    repository: TrainingSessionRepository;
}

const readCount = (stats: unknown, key: string): number => {
    if (typeof stats !== 'object' || stats === null || !(key in stats)) return 0;
    const value: unknown = Reflect.get(stats, key);
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

export const createTrainingSessionService = ({
    repository,
}: CreateTrainingSessionServiceArgs): TrainingSessionService => ({
    listItems: (input = {}) => {
        const limit =
            Number.isInteger(input.limit) && input.limit !== undefined && input.limit > 0 ? input.limit : undefined;
        const offset =
            Number.isInteger(input.offset) && input.offset !== undefined && input.offset > 0 ? input.offset : 0;
        return repository.listItems({ ...input, limit, offset }).map((row) => {
            let stats: unknown;
            if (row.statsJson) {
                try {
                    stats = JSON.parse(row.statsJson);
                } catch {
                    stats = undefined;
                }
            }
            let primaryMetric = row.exerciseCount;
            let secondaryMetric = row.setCount;
            if (row.kind === 'hiit') {
                primaryMetric = readCount(stats, 'completedSets');
                secondaryMetric = readCount(stats, 'completedExercises');
            }
            let durationSec = row.durationSec ?? undefined;
            if (row.kind === 'gym' && row.endedAtMs !== null)
                durationSec = Math.max(
                    0,
                    Math.round((row.endedAtMs - row.startedAtMs) / 1000),
                );
            return {
                id: row.id,
                kind: row.kind,
                title: row.title,
                sourceGymPlanName: row.kind === 'gym' ? row.title : undefined,
                startedAtMs: row.startedAtMs,
                endedAtMs: row.endedAtMs ?? undefined,
                durationSec,
                primaryMetric: String(primaryMetric),
                secondaryMetric: String(secondaryMetric),
                searchText: row.title,
            };
        });
    },
});
