import type {
    TrainingSessionKind,
    TrainingSessionListItem,
} from '@src/core/entities/trainingSession.interfaces';
import type { WorkoutSessionService } from '../workoutSessions/workoutSessionServiceFactory';
import type { GymSessionService } from '../gyms/gymSessionServiceFactory';

export interface ListTrainingSessionsInput {
    kind?: TrainingSessionKind;
    limit?: number;
}

export interface TrainingSessionService {
    listItems: (input?: ListTrainingSessionsInput) => TrainingSessionListItem[];
}

export interface CreateTrainingSessionServiceArgs {
    gymSessionService: GymSessionService;
    workoutSessionService: WorkoutSessionService;
}

const DEFAULT_GYM_SESSION_READ_LIMIT = 100;

const normalizeLimit = (limit: number | undefined): number | undefined =>
    Number.isInteger(limit) && limit != null && limit > 0 ? limit : undefined;

const resolveDurationSec = (
    startedAtMs: number,
    endedAtMs: number | undefined,
): number | undefined => {
    if (endedAtMs == null) return undefined;

    return Math.max(0, Math.round((endedAtMs - startedAtMs) / 1000));
};

export const createTrainingSessionService = ({
    gymSessionService,
    workoutSessionService,
}: CreateTrainingSessionServiceArgs): TrainingSessionService => ({
    listItems: (
        input: ListTrainingSessionsInput = {},
    ): TrainingSessionListItem[] => {
        const hiitItems: TrainingSessionListItem[] =
            workoutSessionService.getAll().map((session) => ({
                id: session.id,
                kind: 'hiit',
                title: session.workoutSnapshot.name,
                startedAtMs: session.startedAtMs,
                endedAtMs: session.endedAtMs,
                durationSec: session.totalDurationSec,
                primaryMetric: `${session.stats?.completedSets ?? 0}`,
                secondaryMetric: `${session.stats?.completedExercises ?? 0}`,
                searchText: session.workoutSnapshot.name,
            }));

        const gymItems: TrainingSessionListItem[] = gymSessionService
            .listGymSessionItems({ limit: DEFAULT_GYM_SESSION_READ_LIMIT })
            .map((session) => {
                const sourceGymPlanName = session.sourceGymPlanName;
                const title = sourceGymPlanName ?? '';

                return {
                    id: session.id,
                    kind: 'gym',
                    title,
                    sourceGymPlanName,
                    startedAtMs: session.startedAtMs,
                    endedAtMs: session.endedAtMs,
                    durationSec: resolveDurationSec(
                        session.startedAtMs,
                        session.endedAtMs,
                    ),
                    primaryMetric: `${session.exerciseRecordCount}`,
                    secondaryMetric: `${session.setCount}`,
                    searchText: title,
                };
            });

        const filteredItems = [...hiitItems, ...gymItems].filter((item) => {
            if (input.kind == null) return true;

            return item.kind === input.kind;
        });

        const sortedItems = filteredItems.sort(
            (a, b) => b.startedAtMs - a.startedAtMs,
        );
        const limit = normalizeLimit(input.limit);

        return limit == null ? sortedItems : sortedItems.slice(0, limit);
    },
});
