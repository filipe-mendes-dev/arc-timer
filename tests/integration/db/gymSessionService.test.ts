import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { asc, eq } from 'drizzle-orm';

import type { Clock } from '@src/db/repositories/repositoryClock';
import {
    isGymError,
    type GymErrorCode,
} from '@src/db/repositories/gyms/gymErrors';
import {
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymSessionsTable,
    exerciseDefinitionsTable,
} from '@src/db/schema';

import { createExerciseDefinitionFixture } from '../../fixtures/exerciseDefinitions';
import {
    createGymPlanExerciseFixture,
    createGymPlanExerciseTargetSetFixture,
    createGymPlanFixture,
    createGymPlanSectionFixture,
} from '../../fixtures/gymPlans.fixtures';
import type { TestDb } from '../../helpers/createTestDb';
import {
    createRepositoryContext,
    type RepositoryContext,
} from '../../helpers/dbIntegrationHelpers';
import { seedExerciseDefinition } from '../../helpers/seedExerciseDefinition';
import { seedGymSession } from '../../helpers/seedGymSession';
import { seedGymPlan } from '../../helpers/seedGymPlan';
import type { GymSessionRow } from 'src/db/repositories/gyms/gymSessionRepositoryFactory';
import type { GymExerciseRecordSetRow } from 'src/db/repositories/gyms/gymExerciseRecordRepositoryFactory';
import {
    createGymExerciseRecordFixture,
    createGymExerciseRecordSetFixture,
    createGymSessionFixture,
} from 'tests/fixtures/gymSession.fixtures';
import { gymSessionToGymSessionListItem } from 'src/db/mappers/gym/gymSessionMapper';

const FIXED_NOW_MS = 1_900_000_000_000;

const fixedClock: Clock = {
    now: () => FIXED_NOW_MS,
};

const expectGymErrorCode = (action: () => void, code: GymErrorCode): void => {
    try {
        action();
    } catch (error) {
        expect(isGymError(error)).toBe(true);
        if (!isGymError(error)) throw error;
        expect(error.code).toBe(code);
        return;
    }

    throw new Error(`Expected gym error ${code}`);
};

const readGymSessionRowOrThrow = (
    testDb: TestDb,
    sessionId: string,
): GymSessionRow => {
    const session = testDb.db
        .select()
        .from(gymSessionsTable)
        .where(eq(gymSessionsTable.id, sessionId))
        .get();

    expect(session).toBeDefined();
    if (!session) {
        throw new Error(`Expected gym session row ${sessionId}`);
    }

    return session;
};

const readGymExerciseRecordSetRowOrThrow = (
    testDb: TestDb,
    setId: string,
): GymExerciseRecordSetRow => {
    const set = testDb.db
        .select()
        .from(gymExerciseRecordSetsTable)
        .where(eq(gymExerciseRecordSetsTable.id, setId))
        .get();

    expect(set).toBeDefined();
    if (!set) {
        throw new Error(`Expected gym exercise record set row ${setId}`);
    }

    return set;
};

describe('gymSessionService integration', () => {
    let context: RepositoryContext;

    beforeEach(() => {
        context = createRepositoryContext(fixedClock);
    });

    afterEach(() => {
        context.testDb.close();
    });

    describe('getActiveGymSession', () => {
        it('returns null when no gym session is active', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expect(gymSessionService.getActiveGymSession()).toBeNull();
        });

        it('returns the active session with its exercise records', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Active Press',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-session-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            const active = gymSessionService.getActiveGymSession();

            expect(active).toEqual(session);
        });
    });

    describe('getGymSessionById', () => {
        it('returns null when the session does not exist', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expect(
                gymSessionService.getGymSessionById('missing-session'),
            ).toBeNull();
        });

        it('hydrates exercise records and sets in persisted order', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const press = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Hydrated Press',
                    availability: 'gym',
                }),
            );

            const curl = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Hydrated Curl',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'hydrated-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'hydrated-first-record',
                            exerciseDefinitionId: press.id,
                            sortIndex: 0,
                            sets: [
                                createGymExerciseRecordSetFixture({
                                    id: 'hydrated-first-set',
                                    setIndex: 0,
                                    reps: 5,
                                }),
                                createGymExerciseRecordSetFixture({
                                    id: 'hydrated-second-set',
                                    setIndex: 1,
                                    reps: 6,
                                }),
                            ],
                        }),
                        createGymExerciseRecordFixture({
                            id: 'hydrated-second-record',
                            exerciseDefinitionId: curl.id,
                            sortIndex: 1,
                        }),
                    ],
                }),
            );

            const hydrated = gymSessionService.getGymSessionById(session.id);

            expect(hydrated).toEqual(session);
        });
    });

    describe('listGymSessionItems', () => {
        it('returns completed sessions and excludes active sessions', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const completedSession = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'completed-session',
                    startedAtMs: FIXED_NOW_MS - 10_000,
                    endedAtMs: FIXED_NOW_MS,
                    status: 'completed',
                }),
            );

            seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS,
                    status: 'active',
                }),
            );

            const sessions = gymSessionService.listGymSessionItems();

            expect(sessions).toEqual([
                gymSessionToGymSessionListItem(completedSession),
            ]);
        });
    });

    describe('startEmptyGymSession', () => {
        it('persists one active session container from the input and current clock', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const session = gymSessionService.startEmptyGymSession({
                notes: 'evening session',
                startedAtMs: FIXED_NOW_MS - 1_000,
            });

            const row = readGymSessionRowOrThrow(context.testDb, session.id);

            expect(row).toMatchObject({
                id: session.id,
                startedAtMs: session.startedAtMs,
                endedAtMs: null,
                status: session.status,
                notes: session.notes ?? null,
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(session).toMatchObject({
                id: row.id,
                startedAtMs: row.startedAtMs,
                endedAtMs: undefined,
                status: 'active',
                notes: 'evening session',
                exerciseRecords: [],
                exerciseRecordCount: 0,
                setCount: 0,
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });
        });

        it('rejects starting another session while one is active', () => {
            const { gymSessionService } = context.testDb.dbServices;

            seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'existing-active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.startEmptyGymSession();
            }, 'ACTIVE_SESSION_EXISTS');
        });
    });

    describe('startGymSessionFromPlan', () => {
        it('creates an active session from a plan in plan order', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const press = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-plan-session-press',
                    name: 'Gym Test Plan Press',
                    availability: 'gym',
                }),
            );

            const row = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-plan-session-row',
                    name: 'Gym Test Plan Row',
                    availability: 'both',
                }),
            );

            const gymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'session-source-plan',
                    sections: [
                        createGymPlanSectionFixture({
                            id: 'session-plan-second-section',
                            sortIndex: 1,
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'session-plan-row',
                                    exerciseDefinitionId: row.id,
                                    sortIndex: 0,
                                    notes: 'row notes',
                                }),
                            ],
                        }),
                        createGymPlanSectionFixture({
                            id: 'session-plan-first-section',
                            sortIndex: 0,
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'session-plan-press',
                                    exerciseDefinitionId: press.id,
                                    sortIndex: 0,
                                    notes: 'press notes',
                                    targetSetDrafts: [
                                        createGymPlanExerciseTargetSetFixture({
                                            id: 'session-plan-press-target-1',
                                            setIndex: 0,
                                            reps: 8,
                                            weightGrams: 80_000,
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const session = gymSessionService.startGymSessionFromPlan({
                gymPlanId: gymPlan.id,
                notes: 'from plan',
                startedAtMs: FIXED_NOW_MS - 1_000,
            });

            const sessionRow = readGymSessionRowOrThrow(
                context.testDb,
                session.id,
            );

            const recordRows = context.testDb.db
                .select()
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.gymSessionId, session.id))
                .orderBy(asc(gymExerciseRecordsTable.sortIndex))
                .all();

            const firstRecordSetRows = context.testDb.db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(
                    eq(
                        gymExerciseRecordSetsTable.gymExerciseRecordId,
                        recordRows[0].id,
                    ),
                )
                .orderBy(asc(gymExerciseRecordSetsTable.setIndex))
                .all();

            expect(sessionRow).toMatchObject({
                id: session.id,
                sourceGymPlanId: gymPlan.id,
                startedAtMs: session.startedAtMs,
                status: 'active',
                notes: session.notes ?? null,
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(recordRows).toHaveLength(2);

            expect(
                recordRows.map((record) => record.sourceGymPlanExerciseId),
            ).toEqual([
                gymPlan.sections[1].exercises[0].id,
                gymPlan.sections[0].exercises[0].id,
            ]);

            expect(
                recordRows.map((record) => record.exerciseDefinitionId),
            ).toEqual([press.id, row.id]);

            expect(recordRows.map((record) => record.sortIndex)).toEqual([
                0, 1,
            ]);

            expect(firstRecordSetRows).toMatchObject([
                {
                    setIndex: 0,
                    reps: 8,
                    weightGrams: 80_000,
                    completedAtMs: null,
                    createdAtMs: FIXED_NOW_MS,
                    updatedAtMs: FIXED_NOW_MS,
                },
            ]);

            expect(session.exerciseRecords[0].sets).toMatchObject([
                {
                    setIndex: 0,
                    reps: 8,
                    weightGrams: 80_000,
                    completedAtMs: undefined,
                    createdAtMs: FIXED_NOW_MS,
                    updatedAtMs: FIXED_NOW_MS,
                },
            ]);

            expect(session.exerciseRecords.map((record) => record.id)).toEqual(
                recordRows.map((record) => record.id),
            );
        });

        it('rejects starting from a missing gym plan', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(() => {
                gymSessionService.startGymSessionFromPlan({
                    gymPlanId: 'missing-plan',
                });
            }, 'GYM_PLAN_NOT_FOUND');
        });

        it('rejects starting from an archived gym plan', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-archived-session-plan',
                    name: 'Gym Test Archived Plan Press',
                    availability: 'gym',
                }),
            );

            const gymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'archived-session-plan',
                    status: 'archived',
                    sections: [
                        createGymPlanSectionFixture({
                            exercises: [
                                createGymPlanExerciseFixture({
                                    exerciseDefinitionId: definition.id,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.startGymSessionFromPlan({
                    gymPlanId: gymPlan.id,
                });
            }, 'GYM_PLAN_ARCHIVED');
        });

        it('rejects before checking the source plan when another gym session is active', () => {
            const { gymSessionService } = context.testDb.dbServices;

            seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'existing-plan-active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.startGymSessionFromPlan({
                    gymPlanId: 'missing-plan',
                });
            }, 'ACTIVE_SESSION_EXISTS');
        });

        it('rejects starting from a plan without exercises', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const gymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'empty-session-plan',
                    sections: [],
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.startGymSessionFromPlan({
                    gymPlanId: gymPlan.id,
                });
            }, 'INVALID_GYM_PLAN');
        });
    });

    describe('addExerciseRecordToSession', () => {
        it('appends gym-available exercise records with session-scoped sort indexes', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const benchPress = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Sort Press',
                    availability: 'gym',
                }),
            );

            const squat = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Sort Squat',
                    availability: 'both',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                }),
            );

            const first = gymSessionService.addExerciseRecordToSession({
                sessionId: session.id,
                exerciseDefinitionId: benchPress.id,
            });

            const second = gymSessionService.addExerciseRecordToSession({
                sessionId: session.id,
                exerciseDefinitionId: squat.id,
            });

            const rows = context.testDb.db
                .select()
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.gymSessionId, session.id))
                .orderBy(asc(gymExerciseRecordsTable.sortIndex))
                .all();

            expect(rows).toHaveLength(2);

            expect(first).toMatchObject({
                exerciseDefinitionId: benchPress.id,
                sortIndex: 0,
                sets: [],
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(second).toMatchObject({
                exerciseDefinitionId: squat.id,
                sortIndex: 1,
                sets: [],
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(rows.map((row) => row.id)).toEqual([first.id, second.id]);
            expect(rows.map((row) => row.exerciseDefinitionId)).toEqual([
                benchPress.id,
                squat.id,
            ]);
            expect(rows.map((row) => row.sortIndex)).toEqual([0, 1]);
        });

        it('rejects workout-only exercise definitions', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const workoutOnlyDefinition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    availability: 'workout',
                    name: 'Workout Only Move',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.addExerciseRecordToSession({
                    sessionId: session.id,
                    exerciseDefinitionId: workoutOnlyDefinition.id,
                });
            }, 'EXERCISE_DEFINITION_NOT_GYM_AVAILABLE');
        });

        it('rejects missing exercise definitions', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.addExerciseRecordToSession({
                    sessionId: session.id,
                    exerciseDefinitionId: 'missing-definition',
                });
            }, 'EXERCISE_DEFINITION_NOT_FOUND');
        });

        it('rejects appending an exercise record to a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Completed Row',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'completed-session',
                    startedAtMs: FIXED_NOW_MS - 2_000,
                    endedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'completed',
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.addExerciseRecordToSession({
                    sessionId: session.id,
                    exerciseDefinitionId: definition.id,
                });
            }, 'SESSION_NOT_MUTABLE');
        });

        it('rejects appending an exercise record to a missing session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(() => {
                gymSessionService.addExerciseRecordToSession({
                    sessionId: 'missing-session',
                    exerciseDefinitionId: 'missing-definition',
                });
            }, 'SESSION_NOT_FOUND');
        });

        it('rejects adding the same exercise definition twice to the same session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Duplicate Press',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'existing-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.addExerciseRecordToSession({
                    sessionId: session.id,
                    exerciseDefinitionId: definition.id,
                });
            }, 'DUPLICATE_EXERCISE_RECORD');
        });
    });

    describe('addSetToExerciseRecord', () => {
        it('appends meaningful sets with record-scoped set indexes', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Set Deadlift',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            const exerciseRecord = session.exerciseRecords[0];

            const first = gymSessionService.addSetToExerciseRecord({
                exerciseRecordId: exerciseRecord.id,
                reps: 5,
                weightGrams: 100_000,
            });

            const second = gymSessionService.addSetToExerciseRecord({
                exerciseRecordId: exerciseRecord.id,
                reps: 3,
                weightGrams: 120_000,
            });

            const rows = context.testDb.db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(
                    eq(
                        gymExerciseRecordSetsTable.gymExerciseRecordId,
                        exerciseRecord.id,
                    ),
                )
                .orderBy(asc(gymExerciseRecordSetsTable.setIndex))
                .all();

            expect(rows).toHaveLength(2);

            expect(first).toMatchObject({
                id: rows[0].id,
                setIndex: 0,
                reps: 5,
                weightGrams: 100_000,
                isWarmup: false,
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(second).toMatchObject({
                id: rows[1].id,
                setIndex: 1,
                reps: 3,
                weightGrams: 120_000,
                isWarmup: false,
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(rows.map((row) => row.setIndex)).toEqual([0, 1]);
        });

        it('rejects set rows without a measurable effort value', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Empty Set Plank',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            const exerciseRecord = session.exerciseRecords[0];

            expectGymErrorCode(() => {
                gymSessionService.addSetToExerciseRecord({
                    exerciseRecordId: exerciseRecord.id,
                    notes: 'empty note only',
                });
            }, 'INVALID_GYM_SET');
        });

        it('rejects appending a set to a record from a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Completed Set Row',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'completed-session',
                    startedAtMs: FIXED_NOW_MS - 2_000,
                    endedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'completed',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'completed-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            const exerciseRecord = session.exerciseRecords[0];

            expectGymErrorCode(() => {
                gymSessionService.addSetToExerciseRecord({
                    exerciseRecordId: exerciseRecord.id,
                    reps: 10,
                });
            }, 'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION');
        });

        it('rejects appending a set to a missing exercise record', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(() => {
                gymSessionService.addSetToExerciseRecord({
                    exerciseRecordId: 'missing-record',
                    reps: 10,
                });
            }, 'EXERCISE_RECORD_NOT_FOUND');
        });

        it.each([
            {
                field: 'reps',
                input: { reps: -1 },
            },
            {
                field: 'weightGrams',
                input: { weightGrams: -1 },
            },
            {
                field: 'durationSec',
                input: { durationSec: -1 },
            },
            {
                field: 'distanceMeters',
                input: { distanceMeters: -1 },
            },
            {
                field: 'rpeTenths',
                input: { rpeTenths: -1 },
            },
            {
                field: 'rpeTenths',
                input: { rpeTenths: 101 },
            },
        ])('rejects invalid $field values', ({ input }) => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Invalid Set Value',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            const exerciseRecord = session.exerciseRecords[0];

            expectGymErrorCode(() => {
                gymSessionService.addSetToExerciseRecord({
                    exerciseRecordId: exerciseRecord.id,
                    ...input,
                });
            }, 'INVALID_GYM_SET');
        });
    });

    describe('updateExerciseRecordSet', () => {
        it('updates editable set fields while preserving the logged set identity', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Update Pull Up',
                    availability: 'both',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                            sets: [
                                createGymExerciseRecordSetFixture({
                                    id: 'active-set',
                                    setIndex: 0,
                                    reps: 8,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const set = session.exerciseRecords[0].sets[0];

            const updated = gymSessionService.updateExerciseRecordSet({
                id: set.id,
                reps: 10,
                rpeTenths: 85,
            });

            const row = readGymExerciseRecordSetRowOrThrow(
                context.testDb,
                set.id,
            );

            expect(updated).toMatchObject({
                id: set.id,
                setIndex: set.setIndex,
                reps: 10,
                rpeTenths: 85,
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(row).toMatchObject({
                id: set.id,
                setIndex: set.setIndex,
                reps: 10,
                rpeTenths: 85,
                updatedAtMs: FIXED_NOW_MS,
            });
        });

        it('rejects editing a set from a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Completed Edit Set Row',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'completed-session',
                    startedAtMs: FIXED_NOW_MS - 2_000,
                    endedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'completed',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'completed-record',
                            exerciseDefinitionId: definition.id,
                            sets: [
                                createGymExerciseRecordSetFixture({
                                    id: 'completed-set',
                                    setIndex: 0,
                                    reps: 12,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const set = session.exerciseRecords[0].sets[0];

            expectGymErrorCode(() => {
                gymSessionService.updateExerciseRecordSet({
                    id: set.id,
                    reps: 10,
                });
            }, 'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION');
        });

        it('rejects editing a missing set', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(() => {
                gymSessionService.updateExerciseRecordSet({
                    id: 'missing-set',
                    reps: 10,
                });
            }, 'EXERCISE_SET_NOT_FOUND');
        });
        it('rejects updates that remove all measurable effort values', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Empty Update Set',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                            sets: [
                                createGymExerciseRecordSetFixture({
                                    id: 'active-set',
                                    reps: 8,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const set = session.exerciseRecords[0].sets[0];

            expectGymErrorCode(() => {
                gymSessionService.updateExerciseRecordSet({
                    id: set.id,
                    reps: undefined,
                    notes: 'empty update',
                });
            }, 'INVALID_GYM_SET');
        });
    });

    describe('finishGymSession', () => {
        it('marks the active session as completed', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const activeSession = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 10_000,
                    status: 'active',
                }),
            );

            const finished = gymSessionService.finishGymSession({
                endedAtMs: FIXED_NOW_MS,
                notes: 'done',
            });

            const row = readGymSessionRowOrThrow(
                context.testDb,
                activeSession.id,
            );

            expect(finished).toMatchObject({
                id: activeSession.id,
                startedAtMs: activeSession.startedAtMs,
                status: 'completed',
                endedAtMs: FIXED_NOW_MS,
                notes: 'done',
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(row).toMatchObject({
                id: activeSession.id,
                startedAtMs: activeSession.startedAtMs,
                status: 'completed',
                endedAtMs: FIXED_NOW_MS,
                notes: 'done',
                createdAtMs: activeSession.createdAtMs,
                updatedAtMs: FIXED_NOW_MS,
            });
        });

        it('rejects an ended time before the session start', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const activeSession = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS,
                    status: 'active',
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.finishGymSession({
                    endedAtMs: activeSession.startedAtMs - 1,
                });
            }, 'INVALID_GYM_SESSION');
        });

        it('rejects finishing when no active session exists', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(() => {
                gymSessionService.finishGymSession();
            }, 'ACTIVE_SESSION_NOT_FOUND');
        });
    });

    describe('discardGymSession', () => {
        it('deletes an active session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const activeSession = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                }),
            );

            gymSessionService.discardGymSession(activeSession.id);

            const row = context.testDb.db
                .select()
                .from(gymSessionsTable)
                .where(eq(gymSessionsTable.id, activeSession.id))
                .get();

            expect(row).toBeUndefined();
        });

        it('rejects discarding a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'completed-session',
                    startedAtMs: FIXED_NOW_MS - 2_000,
                    endedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'completed',
                }),
            );

            expectGymErrorCode(() => {
                gymSessionService.discardGymSession('completed-session');
            }, 'SESSION_NOT_MUTABLE');
        });
        it('deletes exercise records and sets belonging to the discarded session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Discard Press',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                            sets: [
                                createGymExerciseRecordSetFixture({
                                    id: 'active-set',
                                    reps: 10,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const exerciseRecord = session.exerciseRecords[0];
            const set = exerciseRecord.sets[0];

            gymSessionService.discardGymSession(session.id);

            const sessionRow = context.testDb.db
                .select()
                .from(gymSessionsTable)
                .where(eq(gymSessionsTable.id, session.id))
                .get();

            const exerciseRecordRow = context.testDb.db
                .select()
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.id, exerciseRecord.id))
                .get();

            const setRow = context.testDb.db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(eq(gymExerciseRecordSetsTable.id, set.id))
                .get();

            expect(sessionRow).toBeUndefined();
            expect(exerciseRecordRow).toBeUndefined();
            expect(setRow).toBeUndefined();
        });
        it('deletes user exercise definitions that become unreferenced after discarding the session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'session-only-definition',
                    name: 'Session Only Exercise',
                    availability: 'gym',
                    source: 'user',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            gymSessionService.discardGymSession(session.id);

            const deletedDefinition = context.testDb.db
                .select()
                .from(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.id, definition.id))
                .get();

            expect(deletedDefinition).toBeUndefined();
        });

        it('keeps exercise definitions that are still referenced elsewhere after discarding the session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'shared-definition',
                    name: 'Shared Exercise',
                    availability: 'gym',
                    source: 'user',
                }),
            );

            const discardedSession = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'discarded-session',
                    startedAtMs: FIXED_NOW_MS - 2_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'discarded-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'other-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'completed',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'other-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            gymSessionService.discardGymSession(discardedSession.id);

            const definitionRow = context.testDb.db
                .select()
                .from(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.id, definition.id))
                .get();

            expect(definitionRow).toBeDefined();
        });
        it('keeps system exercise definitions even when they become unreferenced after discarding the session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'system-definition',
                    name: 'Bench Press',
                    availability: 'gym',
                    source: 'system',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            gymSessionService.discardGymSession(session.id);

            const definitionRow = context.testDb.db
                .select()
                .from(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.id, definition.id))
                .get();

            expect(definitionRow).toBeDefined();
        });
    });

    describe('deleteExerciseRecord', () => {
        it('removes the exercise record and its sets from the active session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Delete Split Squat',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                            sets: [
                                createGymExerciseRecordSetFixture({
                                    id: 'active-set',
                                    reps: 8,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const exerciseRecord = session.exerciseRecords[0];
            const set = exerciseRecord.sets[0];

            gymSessionService.deleteExerciseRecord(exerciseRecord.id);

            const deletedRecord = context.testDb.db
                .select()
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.id, exerciseRecord.id))
                .get();

            const deletedSet = context.testDb.db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(eq(gymExerciseRecordSetsTable.id, set.id))
                .get();

            expect(deletedRecord).toBeUndefined();
            expect(deletedSet).toBeUndefined();
        });

        it('rejects deleting a missing exercise record', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(() => {
                gymSessionService.deleteExerciseRecord('missing-record');
            }, 'EXERCISE_RECORD_NOT_FOUND');
        });

        it('rejects deleting an exercise record from a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Completed Delete Record',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'completed-session',
                    startedAtMs: FIXED_NOW_MS - 2_000,
                    endedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'completed',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'completed-record',
                            exerciseDefinitionId: definition.id,
                        }),
                    ],
                }),
            );

            const exerciseRecord = session.exerciseRecords[0];

            expectGymErrorCode(() => {
                gymSessionService.deleteExerciseRecord(exerciseRecord.id);
            }, 'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION');
        });
    });

    describe('deleteExerciseRecordSet', () => {
        it('removes a set from an active exercise record', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Delete Pull Up',
                    availability: 'both',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'active-session',
                    startedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'active',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'active-record',
                            exerciseDefinitionId: definition.id,
                            sets: [
                                createGymExerciseRecordSetFixture({
                                    id: 'active-set',
                                    reps: 8,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const set = session.exerciseRecords[0].sets[0];

            gymSessionService.deleteExerciseRecordSet(set.id);

            const deletedSet = context.testDb.db
                .select()
                .from(gymExerciseRecordSetsTable)
                .where(eq(gymExerciseRecordSetsTable.id, set.id))
                .get();

            expect(deletedSet).toBeUndefined();
        });

        it('rejects deleting a missing set', () => {
            const { gymSessionService } = context.testDb.dbServices;

            expectGymErrorCode(() => {
                gymSessionService.deleteExerciseRecordSet('missing-set');
            }, 'EXERCISE_SET_NOT_FOUND');
        });

        it('rejects deleting a set from a completed session', () => {
            const { gymSessionService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    name: 'Gym Test Completed Delete Set',
                    availability: 'gym',
                }),
            );

            const session = seedGymSession(
                context.testDb,
                createGymSessionFixture({
                    id: 'completed-session',
                    startedAtMs: FIXED_NOW_MS - 2_000,
                    endedAtMs: FIXED_NOW_MS - 1_000,
                    status: 'completed',
                    exerciseRecords: [
                        createGymExerciseRecordFixture({
                            id: 'completed-record',
                            exerciseDefinitionId: definition.id,
                            sets: [
                                createGymExerciseRecordSetFixture({
                                    id: 'completed-set',
                                    reps: 8,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const set = session.exerciseRecords[0].sets[0];

            expectGymErrorCode(() => {
                gymSessionService.deleteExerciseRecordSet(set.id);
            }, 'EXERCISE_RECORD_NOT_IN_ACTIVE_SESSION');
        });
    });
});
