import type {
    GymExerciseRecord,
    GymExerciseRecordSet,
    GymSession,
    GymSessionListItem,
} from '@src/core/entities/gymSession.interfaces';
import { uid } from '@src/core/id';

import { createGymError, gymErrors } from '../../repositories/gyms/gymErrors';
import type {
    GymExerciseRecordRepository,
    PersistedGymExerciseRecord,
    PersistedGymExerciseRecordSet,
} from '../../repositories/gyms/gymExerciseRecordRepositoryFactory';
import type { GymPlanRepository } from '../../repositories/gyms/gymPlanRepositoryFactory';
import type {
    GymSessionRepository,
    GymSessionRow,
    InsertGymSessionAggregateInput,
} from '../../repositories/gyms/gymSessionRepositoryFactory';
import { systemClock, type Clock } from '../../repositories/repositoryClock';
import type { ExerciseDefinitionService } from '../exerciseDefinitions/exerciseDefinitionServiceFactory';
import type { ExerciseDefinitionStatsRepository } from '../../repositories/exerciseDefinitions/exerciseDefinitionStatsRepositoryFactory';

export interface ListGymSessionsInput {
    limit?: number;
}

export interface StartEmptyGymSessionInput {
    notes?: string;
    startedAtMs?: number;
}

export interface StartGymSessionFromPlanInput {
    gymPlanId: string;
    notes?: string;
    startedAtMs?: number;
}

export interface StartGymSessionFromSessionSnapshotInput {
    sessionId: string;
    startedAtMs?: number;
}

export interface AddExerciseRecordToSessionInput {
    exerciseDefinitionId?: string;
    name?: string;
    notes?: string;
    sessionId: string;
    startedAtMs?: number;
}
export interface AddSetToExerciseRecordInput {
    completedAtMs?: number;
    distanceMeters?: number;
    durationSec?: number;
    exerciseRecordId: string;
    isWarmup?: boolean;
    notes?: string;
    reps?: number;
    rpeTenths?: number | null;
    weightGrams?: number;
}

export interface UpdateExerciseRecordSetInput {
    completedAtMs?: number | null;
    distanceMeters?: number | null;
    durationSec?: number | null;
    id: string;
    isWarmup?: boolean;
    notes?: string;
    reps?: number | null;
    rpeTenths?: number | null;
    setIndex?: number;
    weightGrams?: number | null;
}

export interface FinishGymSessionInput {
    endedAtMs?: number;
    notes?: string;
}

export interface GymSessionService {
    getActiveGymSession: () => GymSession | null;
    getGymSessionById: (id: string) => GymSession | null;
    listGymSessionItems: (input?: ListGymSessionsInput) => GymSessionListItem[];
    startEmptyGymSession: (input?: StartEmptyGymSessionInput) => GymSession;
    startGymSessionFromPlan: (
        input: StartGymSessionFromPlanInput,
    ) => GymSession;
    startGymSessionFromSessionSnapshot: (
        input: StartGymSessionFromSessionSnapshotInput,
    ) => GymSession;
    addExerciseRecordToSession: (
        input: AddExerciseRecordToSessionInput,
    ) => GymExerciseRecord;
    addSetToExerciseRecord: (
        input: AddSetToExerciseRecordInput,
    ) => GymExerciseRecordSet;
    updateExerciseRecordSet: (
        input: UpdateExerciseRecordSetInput,
    ) => GymExerciseRecordSet;
    finishGymSession: (input?: FinishGymSessionInput) => GymSession;
    discardGymSession: (id: string) => void;
    deleteGymSession: (id: string) => void;
    deleteExerciseRecord: (id: string) => void;
    deleteExerciseRecordSet: (id: string) => void;
}

export interface CreateGymSessionServiceArgs {
    clock?: Clock;
    exerciseDefinitionService: ExerciseDefinitionService;
    exerciseDefinitionStatsRepository: ExerciseDefinitionStatsRepository;
    gymExerciseRecordRepository: GymExerciseRecordRepository;
    gymPlanRepository: GymPlanRepository;
    gymSessionRepository: GymSessionRepository;
}

const DEFAULT_RECENT_SESSION_LIMIT = 10;

const gymExerciseRecordSetFromPersisted = (
    set: PersistedGymExerciseRecordSet,
): GymExerciseRecordSet => ({
    id: set.id,
    setIndex: set.setIndex,
    reps: set.reps,
    weightGrams: set.weightGrams,
    durationSec: set.durationSec,
    distanceMeters: set.distanceMeters,
    rpeTenths: set.rpeTenths,
    isWarmup: set.isWarmup,
    completedAtMs: set.completedAtMs,
    notes: set.notes,
    createdAtMs: set.createdAtMs,
    updatedAtMs: set.updatedAtMs,
});

const gymExerciseRecordFromPersisted = (
    record: PersistedGymExerciseRecord,
): GymExerciseRecord => ({
    id: record.id,
    exerciseDefinitionId: record.exerciseDefinitionId,
    sourceGymPlanExerciseId: record.sourceGymPlanExerciseId,
    sortIndex: record.sortIndex,
    startedAtMs: record.startedAtMs,
    notes: record.notes,
    sets: record.sets.map(gymExerciseRecordSetFromPersisted),
    createdAtMs: record.createdAtMs,
    updatedAtMs: record.updatedAtMs,
});

const gymSessionFromRow = (
    row: GymSessionRow,
    records: PersistedGymExerciseRecord[],
): GymSession => ({
    id: row.id,
    startedAtMs: row.startedAtMs,
    endedAtMs: row.endedAtMs ?? undefined,
    status: row.status,
    sourceGymPlanId: row.sourceGymPlanId ?? undefined,
    exerciseRecordCount: records.length,
    setCount: records.reduce((total, record) => total + record.sets.length, 0),
    notes: row.notes ?? undefined,
    exerciseRecords: records.map(gymExerciseRecordFromPersisted),
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

const hasMeaningfulSetValue = (
    set: Pick<
        GymExerciseRecordSet,
        'distanceMeters' | 'durationSec' | 'reps' | 'weightGrams'
    >,
): boolean =>
    set.reps !== undefined ||
    set.weightGrams !== undefined ||
    set.durationSec !== undefined ||
    set.distanceMeters !== undefined;

const hasCompletedSet = (record: PersistedGymExerciseRecord): boolean =>
    record.sets.some((set) => set.completedAtMs !== undefined);

export const createGymSessionService = ({
    clock = systemClock,
    exerciseDefinitionService,
    exerciseDefinitionStatsRepository,
    gymExerciseRecordRepository,
    gymPlanRepository,
    gymSessionRepository,
}: CreateGymSessionServiceArgs): GymSessionService => {
    const hydrateSessionRow = (row: GymSessionRow): GymSession =>
        gymSessionFromRow(
            row,
            gymExerciseRecordRepository.getBySessionId(row.id),
        );

    const getSessionOrThrow = (id: string): GymSessionRow => {
        const session = gymSessionRepository.getById(id);
        if (!session) {
            throw createGymError(gymErrors.sessionNotFound);
        }

        return session;
    };

    const getActiveSessionOrThrow = (id?: string): GymSessionRow => {
        const session = id
            ? gymSessionRepository.getById(id)
            : gymSessionRepository.getActive();
        if (!session) {
            if (id) {
                throw createGymError(gymErrors.sessionNotFound);
            }

            throw createGymError(gymErrors.activeSessionNotFound);
        }

        if (session.status !== 'active') {
            throw createGymError(gymErrors.sessionNotMutable);
        }

        return session;
    };

    const getRecordInActiveSessionOrThrow = (
        recordId: string,
    ): PersistedGymExerciseRecord => {
        const record = gymExerciseRecordRepository.getById(recordId);
        if (!record) {
            throw createGymError(gymErrors.exerciseRecordNotFound);
        }

        const session = gymSessionRepository.getById(record.gymSessionId);
        if (session?.status !== 'active') {
            throw createGymError(gymErrors.exerciseRecordNotInActiveSession);
        }

        return record;
    };

    const getSetInActiveSessionOrThrow = (
        setId: string,
    ): PersistedGymExerciseRecordSet => {
        const set = gymExerciseRecordRepository.getSetById(setId);
        if (!set) {
            throw createGymError(gymErrors.exerciseSetNotFound);
        }

        getRecordInActiveSessionOrThrow(set.gymExerciseRecordId);

        return set;
    };

    const assertExerciseDefinitionCanBeUsed = (
        exerciseDefinitionId: string,
    ): void => {
        const definition =
            exerciseDefinitionService.getById(exerciseDefinitionId);
        if (!definition) {
            throw createGymError(gymErrors.exerciseDefinitionNotFound);
        }

        if (definition.availability === 'workout') {
            throw createGymError(gymErrors.exerciseDefinitionNotGymAvailable);
        }
    };

    const assertSetIsMeaningful = (
        set: Pick<
            GymExerciseRecordSet,
            'distanceMeters' | 'durationSec' | 'reps' | 'weightGrams'
        >,
    ): void => {
        if (!hasMeaningfulSetValue(set)) {
            throw createGymError(gymErrors.invalidGymSet);
        }
    };

    const getSessionCreatedUserExerciseDefinitionIds = (
        exerciseDefinitionIds: string[],
        startedAtMs: number,
        endedAtMs: number,
    ): string[] =>
        [...new Set(exerciseDefinitionIds)].filter((id) => {
            const definition = exerciseDefinitionService.getById(id);

            return (
                definition?.source === 'user' &&
                definition.createdAtMs >= startedAtMs &&
                definition.createdAtMs <= endedAtMs
            );
        });

    const service: GymSessionService = {
        getActiveGymSession: (): GymSession | null => {
            const session = gymSessionRepository.getActive();
            return session ? hydrateSessionRow(session) : null;
        },

        getGymSessionById: (id: string): GymSession | null => {
            const session = gymSessionRepository.getById(id);
            return session ? hydrateSessionRow(session) : null;
        },

        listGymSessionItems: ({
            limit = DEFAULT_RECENT_SESSION_LIMIT,
        }: ListGymSessionsInput = {}): GymSessionListItem[] =>
            gymSessionRepository.getRecentListItems(limit),

        startEmptyGymSession: (
            input: StartEmptyGymSessionInput = {},
        ): GymSession => {
            if (gymSessionRepository.hasActive()) {
                throw createGymError(gymErrors.activeSessionExists);
            }

            const nowMs = clock.now();
            const startedAtMs = input.startedAtMs ?? nowMs;
            const id = uid();
            gymSessionRepository.insert({
                id,
                startedAtMs,
                status: 'active',
                notes: input.notes,
                createdAtMs: nowMs,
                updatedAtMs: nowMs,
            });

            return hydrateSessionRow(getSessionOrThrow(id));
        },

        startGymSessionFromPlan: ({
            gymPlanId,
            notes,
            startedAtMs,
        }: StartGymSessionFromPlanInput): GymSession => {
            if (gymSessionRepository.hasActive()) {
                throw createGymError(gymErrors.activeSessionExists);
            }

            const gymPlan = gymPlanRepository.getById(gymPlanId);
            if (!gymPlan) {
                throw createGymError(gymErrors.gymPlanNotFound);
            }

            if (gymPlan.status === 'archived') {
                throw createGymError(gymErrors.gymPlanArchived);
            }

            if (gymPlan.status === 'draft') {
                throw createGymError(gymErrors.invalidGymPlan);
            }

            const planExercises = gymPlan.sections.flatMap(
                (section) => section.exercises,
            );
            planExercises.forEach((exercise) => {
                assertExerciseDefinitionCanBeUsed(
                    exercise.exerciseDefinitionId,
                );
            });

            const nowMs = clock.now();
            const sessionId = uid();
            const resolvedStartedAtMs = startedAtMs ?? nowMs;
            const exerciseRecords: InsertGymSessionAggregateInput['exerciseRecords'] =
                [];
            const exerciseRecordSets: InsertGymSessionAggregateInput['exerciseRecordSets'] =
                [];

            planExercises.forEach((exercise, index) => {
                const recordId = uid();
                exerciseRecords.push({
                    id: recordId,
                    gymSessionId: sessionId,
                    exerciseDefinitionId: exercise.exerciseDefinitionId,
                    sourceGymPlanExerciseId: exercise.id,
                    sortIndex: index,
                    notes: exercise.notes,
                    createdAtMs: nowMs,
                    updatedAtMs: nowMs,
                });

                (exercise.targetSetDrafts ?? []).forEach(
                    (targetSet, setIndex) => {
                        exerciseRecordSets.push({
                            id: uid(),
                            gymExerciseRecordId: recordId,
                            setIndex,
                            reps: targetSet.reps,
                            weightGrams: targetSet.weightGrams,
                            durationSec: targetSet.durationSec,
                            distanceMeters: targetSet.distanceMeters,
                            rpeTenths: targetSet.rpeTenths,
                            isWarmup: false,
                            createdAtMs: nowMs,
                            updatedAtMs: nowMs,
                        });
                    },
                );
            });

            gymSessionRepository.insertWithExerciseRecords({
                session: {
                    id: sessionId,
                    startedAtMs: resolvedStartedAtMs,
                    status: 'active',
                    sourceGymPlanId: gymPlan.id,
                    notes,
                    createdAtMs: nowMs,
                    updatedAtMs: nowMs,
                },
                exerciseRecords,
                exerciseRecordSets,
            });

            return hydrateSessionRow(getSessionOrThrow(sessionId));
        },

        startGymSessionFromSessionSnapshot: ({
            sessionId,
            startedAtMs,
        }: StartGymSessionFromSessionSnapshotInput): GymSession => {
            if (gymSessionRepository.hasActive()) {
                throw createGymError(gymErrors.activeSessionExists);
            }

            const sourceSession = getSessionOrThrow(sessionId);
            const sourceRecords = gymExerciseRecordRepository.getBySessionId(
                sourceSession.id,
            );
            sourceRecords.forEach((record) => {
                assertExerciseDefinitionCanBeUsed(record.exerciseDefinitionId);
            });

            const nowMs = clock.now();
            const newSessionId = uid();
            const resolvedStartedAtMs = startedAtMs ?? nowMs;
            const sourceGymPlan =
                sourceSession.sourceGymPlanId !== null
                    ? gymPlanRepository.getById(sourceSession.sourceGymPlanId)
                    : null;
            const sourceGymPlanId =
                sourceGymPlan?.status === 'active'
                    ? sourceGymPlan.id
                    : undefined;

            gymSessionRepository.insertWithExerciseRecords({
                session: {
                    id: newSessionId,
                    startedAtMs: resolvedStartedAtMs,
                    status: 'active',
                    sourceGymPlanId,
                    notes: sourceSession.notes ?? undefined,
                    createdAtMs: nowMs,
                    updatedAtMs: nowMs,
                },
                exerciseRecords: sourceRecords.map((record, index) => ({
                    id: uid(),
                    gymSessionId: newSessionId,
                    exerciseDefinitionId: record.exerciseDefinitionId,
                    sourceGymPlanExerciseId: record.sourceGymPlanExerciseId,
                    sortIndex: index,
                    startedAtMs: undefined,
                    notes: record.notes,
                    createdAtMs: nowMs,
                    updatedAtMs: nowMs,
                })),
                exerciseRecordSets: [],
            });

            return hydrateSessionRow(getSessionOrThrow(newSessionId));
        },

        addExerciseRecordToSession: ({
            exerciseDefinitionId,
            name,
            notes,
            sessionId,
            startedAtMs,
        }: AddExerciseRecordToSessionInput): GymExerciseRecord => {
            const session = getActiveSessionOrThrow(sessionId);
            let targetDefinitionId = exerciseDefinitionId;

            if (!targetDefinitionId) {
                const definition =
                    exerciseDefinitionService.findOrCreateUserExerciseDefinitionByName(
                        name ?? '',
                    );

                if (!definition) {
                    throw createGymError(gymErrors.exerciseNameRequired);
                }

                targetDefinitionId = definition.id;
            }

            assertExerciseDefinitionCanBeUsed(targetDefinitionId);

            const nowMs = clock.now();
            const id = uid();
            gymExerciseRecordRepository.insertRecord({
                id,
                gymSessionId: session.id,
                exerciseDefinitionId: targetDefinitionId,
                sortIndex: gymExerciseRecordRepository.getNextRecordSortIndex(
                    session.id,
                ),
                startedAtMs,
                notes,
                createdAtMs: nowMs,
                updatedAtMs: nowMs,
            });

            const record = gymExerciseRecordRepository.getById(id);
            if (!record) {
                throw createGymError(gymErrors.exerciseRecordNotFound);
            }

            return gymExerciseRecordFromPersisted(record);
        },

        addSetToExerciseRecord: ({
            completedAtMs,
            distanceMeters,
            durationSec,
            exerciseRecordId,
            isWarmup = false,
            notes,
            reps,
            rpeTenths,
            weightGrams,
        }: AddSetToExerciseRecordInput): GymExerciseRecordSet => {
            getRecordInActiveSessionOrThrow(exerciseRecordId);
            assertSetIsMeaningful({
                distanceMeters,
                durationSec,
                reps,
                weightGrams,
            });

            const nowMs = clock.now();
            const id = uid();
            gymExerciseRecordRepository.insertSet({
                id,
                gymExerciseRecordId: exerciseRecordId,
                setIndex:
                    gymExerciseRecordRepository.getNextSetIndex(
                        exerciseRecordId,
                    ),
                reps,
                weightGrams,
                durationSec,
                distanceMeters,
                rpeTenths,
                isWarmup,
                completedAtMs,
                notes,
                createdAtMs: nowMs,
                updatedAtMs: nowMs,
            });

            const set = gymExerciseRecordRepository.getSetById(id);
            if (!set) {
                throw createGymError(gymErrors.exerciseSetNotFound);
            }

            return gymExerciseRecordSetFromPersisted(set);
        },

        updateExerciseRecordSet: ({
            completedAtMs,
            distanceMeters,
            durationSec,
            id,
            isWarmup,
            notes,
            reps,
            rpeTenths,
            setIndex,
            weightGrams,
        }: UpdateExerciseRecordSetInput): GymExerciseRecordSet => {
            getSetInActiveSessionOrThrow(id);

            gymExerciseRecordRepository.updateSet({
                id,
                completedAtMs,
                distanceMeters,
                durationSec,
                isWarmup,
                notes,
                reps,
                rpeTenths,
                setIndex,
                updatedAtMs: clock.now(),
                weightGrams,
            });

            const updated = gymExerciseRecordRepository.getSetById(id);
            if (!updated) {
                throw createGymError(gymErrors.exerciseSetNotFound);
            }

            return gymExerciseRecordSetFromPersisted(updated);
        },

        finishGymSession: (input: FinishGymSessionInput = {}): GymSession => {
            const session = getActiveSessionOrThrow();
            const nowMs = clock.now();
            const endedAtMs = input.endedAtMs ?? nowMs;
            if (endedAtMs < session.startedAtMs) {
                throw createGymError(gymErrors.invalidGymSessionTimeRange);
            }

            const records = gymExerciseRecordRepository.getBySessionId(
                session.id,
            );
            const prunedRecords = records.filter(
                (record) => !hasCompletedSet(record),
            );
            const retainedRecords = records.filter(hasCompletedSet);
            const prunedExerciseDefinitionIds = prunedRecords.map(
                (record) => record.exerciseDefinitionId,
            );
            const retainedExerciseDefinitionIds = retainedRecords.map(
                (record) => record.exerciseDefinitionId,
            );
            const sessionCreatedDefinitionIds =
                getSessionCreatedUserExerciseDefinitionIds(
                    prunedExerciseDefinitionIds,
                    session.startedAtMs,
                    endedAtMs,
                );

            prunedRecords.forEach((record) => {
                gymExerciseRecordRepository.deleteRecord(record.id);
            });

            gymSessionRepository.update({
                id: session.id,
                status: 'completed',
                endedAtMs,
                notes: input.notes,
                updatedAtMs: nowMs,
            });
            exerciseDefinitionStatsRepository.rebuildForExerciseDefinitionIds({
                exerciseDefinitionIds: [
                    ...retainedExerciseDefinitionIds,
                    ...prunedExerciseDefinitionIds,
                ],
                updatedAtMs: nowMs,
            });
            exerciseDefinitionService.deleteUnreferencedUserExerciseDefinitions(
                sessionCreatedDefinitionIds,
            );

            return hydrateSessionRow(getSessionOrThrow(session.id));
        },

        discardGymSession: (id: string): void => {
            const session = getActiveSessionOrThrow(id);
            const exerciseDefinitionIds = gymExerciseRecordRepository
                .getBySessionId(session.id)
                .map((record) => record.exerciseDefinitionId);

            gymSessionRepository.delete(session.id);
            exerciseDefinitionService.deleteUnreferencedUserExerciseDefinitions(
                exerciseDefinitionIds,
            );
        },

        deleteGymSession: (id: string): void => {
            const session = getSessionOrThrow(id);

            if (session.status === 'active') {
                throw createGymError(gymErrors.activeSessionCannotBeDeleted);
            }

            const exerciseDefinitionIds = gymExerciseRecordRepository
                .getBySessionId(session.id)
                .map((record) => record.exerciseDefinitionId);

            gymSessionRepository.delete(id);
            exerciseDefinitionStatsRepository.rebuildForExerciseDefinitionIds({
                exerciseDefinitionIds,
                updatedAtMs: clock.now(),
            });
        },

        deleteExerciseRecord: (id: string): void => {
            getRecordInActiveSessionOrThrow(id);
            gymExerciseRecordRepository.deleteRecord(id);
        },

        deleteExerciseRecordSet: (id: string): void => {
            getSetInActiveSessionOrThrow(id);
            gymExerciseRecordRepository.deleteSet(id);
        },
    };

    return service;
};
