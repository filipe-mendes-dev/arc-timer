import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { asc, eq } from 'drizzle-orm';

import type { Clock } from '@src/db/repositories/repositoryClock';
import {
    isGymError,
    type GymErrorCode,
} from '@src/db/repositories/gyms/gymErrors';
import {
    gymPlanExerciseTargetSetsTable,
    gymPlanExercisesTable,
    gymPlansTable,
    gymPlanSectionsTable,
} from '@src/db/schema';

import { createExerciseDefinitionFixture } from '../../fixtures/exerciseDefinitions';

import type { TestDb } from '../../helpers/createTestDb';
import {
    createRepositoryContext,
    type RepositoryContext,
} from '../../helpers/dbIntegrationHelpers';
import { seedExerciseDefinition } from '../../helpers/seedExerciseDefinition';
import { seedGymPlan } from '../../helpers/seedGymPlan';
import { gymPlanToGymPlanListItem } from 'src/db/mappers/gym/gymPlanMapper';
import type { GymPlanFixtureArgs } from 'tests/fixtures/gymPlans.fixtures';
import {
    createGymPlanExerciseFixture,
    createGymPlanExerciseTargetSetFixture,
    createGymPlanFixture,
    createGymPlanSectionFixture,
} from 'tests/fixtures/gymPlans.fixtures';
import type { GymPlan } from 'src/core/entities/gymPlan.interfaces';

const FIXED_NOW_MS = 1_900_000_000_000;

const fixedClock: Clock = {
    now: () => FIXED_NOW_MS,
};

type GymPlanRow = typeof gymPlansTable.$inferSelect;
type GymPlanSectionRow = typeof gymPlanSectionsTable.$inferSelect;
type GymPlanExerciseRow = typeof gymPlanExercisesTable.$inferSelect;
type GymPlanExerciseTargetSetRow =
    typeof gymPlanExerciseTargetSetsTable.$inferSelect;

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

const readGymPlanRowOrThrow = (
    testDb: TestDb,
    gymPlanId: string,
): GymPlanRow => {
    const gymPlan = testDb.db
        .select()
        .from(gymPlansTable)
        .where(eq(gymPlansTable.id, gymPlanId))
        .get();

    expect(gymPlan).toBeDefined();
    if (!gymPlan) {
        throw new Error(`Expected gym plan row ${gymPlanId}`);
    }

    return gymPlan;
};

const readGymPlanSections = (
    testDb: TestDb,
    gymPlanId: string,
): GymPlanSectionRow[] =>
    testDb.db
        .select()
        .from(gymPlanSectionsTable)
        .where(eq(gymPlanSectionsTable.gymPlanId, gymPlanId))
        .orderBy(asc(gymPlanSectionsTable.sortIndex))
        .all();

const readGymPlanExercises = (
    testDb: TestDb,
    sectionId: string,
): GymPlanExerciseRow[] =>
    testDb.db
        .select()
        .from(gymPlanExercisesTable)
        .where(eq(gymPlanExercisesTable.gymPlanSectionId, sectionId))
        .orderBy(asc(gymPlanExercisesTable.sortIndex))
        .all();

const readGymPlanExerciseTargetSets = (
    testDb: TestDb,
    exerciseId: string,
): GymPlanExerciseTargetSetRow[] =>
    testDb.db
        .select()
        .from(gymPlanExerciseTargetSetsTable)
        .where(eq(gymPlanExerciseTargetSetsTable.gymPlanExerciseId, exerciseId))
        .orderBy(asc(gymPlanExerciseTargetSetsTable.setIndex))
        .all();

describe('gymPlanService integration', () => {
    let context: RepositoryContext;

    beforeEach(() => {
        context = createRepositoryContext(fixedClock);
    });

    afterEach(() => {
        context.testDb.close();
    });

    describe('listGymPlanItems', () => {
        it('returns active plans by favorite and recency while hiding archived plans', () => {
            const { gymPlanService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-list-gym-plan',
                    name: 'Gym Plan List Press',
                    availability: 'gym',
                }),
            );
            const plan1 = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'older-plan',
                    name: 'Older Plan',
                    updatedAtMs: FIXED_NOW_MS - 2_000,
                    sections: [
                        createGymPlanSectionFixture({
                            id: 'older-section',
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'older-exercise',
                                    exerciseDefinitionId: definition.id,
                                }),
                            ],
                        }),
                    ],
                }),
            );
            const plan2 = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'favorite-plan',
                    name: 'Favorite Plan',
                    isFavorite: true,
                    updatedAtMs: FIXED_NOW_MS - 3_000,
                    sections: [
                        createGymPlanSectionFixture({
                            id: 'favorite-section',
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'favorite-exercise',
                                    exerciseDefinitionId: definition.id,
                                }),
                            ],
                        }),
                    ],
                }),
            );
            const plan3 = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'archived-plan',
                    name: 'Archived Plan',
                    status: 'archived',
                    updatedAtMs: FIXED_NOW_MS,
                    sections: [
                        createGymPlanSectionFixture({
                            id: 'archived-section',
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'archived-exercise',
                                    exerciseDefinitionId: definition.id,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const activePlans = gymPlanService.listGymPlanItems();
            const allPlans = gymPlanService.listGymPlanItems({
                includeArchived: true,
            });

            expect(activePlans.map((plan) => plan.id)).toEqual([
                'favorite-plan',
                'older-plan',
            ]);
            expect(allPlans.map((plan) => plan.id)).toEqual([
                'favorite-plan',
                'archived-plan',
                'older-plan',
            ]);
            expect(activePlans).toEqual([
                gymPlanToGymPlanListItem(plan2),
                gymPlanToGymPlanListItem(plan1),
            ]);

            expect(allPlans).toEqual([
                gymPlanToGymPlanListItem(plan2),
                gymPlanToGymPlanListItem(plan3),
                gymPlanToGymPlanListItem(plan1),
            ]);
        });
    });

    describe('getGymPlanById', () => {
        it('hydrates sections and exercises in persisted order', () => {
            const { gymPlanService } = context.testDb.dbServices;
            const press = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-hydrate-press',
                    name: 'Gym Plan Hydrate Press',
                    availability: 'gym',
                }),
            );
            const row = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-hydrate-row',
                    name: 'Gym Plan Hydrate Row',
                    availability: 'both',
                }),
            );
            const gymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'hydrated-plan',
                    sections: [
                        createGymPlanSectionFixture({
                            id: 'hydrated-second-section',
                            sortIndex: 1,
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'hydrated-row',
                                    exerciseDefinitionId: row.id,
                                    sortIndex: 0,
                                }),
                            ],
                        }),
                        createGymPlanSectionFixture({
                            id: 'hydrated-first-section',
                            sortIndex: 0,
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'hydrated-press',
                                    exerciseDefinitionId: press.id,
                                    sortIndex: 0,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const hydrated = gymPlanService.getGymPlanById('hydrated-plan');

            expect(hydrated?.sections.map((section) => section.id)).toEqual([
                'hydrated-first-section',
                'hydrated-second-section',
            ]);
            expect(
                hydrated?.sections[0]?.exercises.map((item) => item.id),
            ).toEqual(['hydrated-press']);
            expect(
                hydrated?.sections[1]?.exercises.map((item) => item.id),
            ).toEqual(['hydrated-row']);

            expect(hydrated).toEqual({
                ...gymPlan,
                sections: [gymPlan.sections[1], gymPlan.sections[0]],
            });
        });
    });

    describe('upsertDraftGymPlan', () => {
        let exerciseDefinitionId: string;

        beforeEach(() => {
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-upsert-draft-plan',
                    name: 'Upsert Draft Plan Exercise',
                    availability: 'gym',
                }),
            );

            exerciseDefinitionId = definition.id;
        });

        const createDraftPlan = (args: GymPlanFixtureArgs = {}): GymPlan => {
            const gymPlanId = args.id ?? 'draft-plan';

            return createGymPlanFixture({
                ...args,
                id: gymPlanId,
                sections: args.sections ?? [
                    createGymPlanSectionFixture({
                        id: `${gymPlanId}-section-1`,
                        exercises: [
                            createGymPlanExerciseFixture({
                                id: `${gymPlanId}-exercise-1`,
                                exerciseDefinitionId,
                            }),
                        ],
                    }),
                ],
            });
        };

        it('creates a draft gym plan when no draft exists', () => {
            const { gymPlanService } = context.testDb.dbServices;

            const gymPlan = createDraftPlan({
                id: 'new-draft-plan',
                name: '  Draft Plan  ',
                status: 'active',
            });

            gymPlanService.upsertDraftGymPlan(gymPlan);

            const draft = readGymPlanRowOrThrow(context.testDb, gymPlan.id);
            const sections = readGymPlanSections(context.testDb, gymPlan.id);
            const exercises = readGymPlanExercises(
                context.testDb,
                sections[0].id,
            );

            expect(draft).toMatchObject({
                id: gymPlan.id,
                name: gymPlan.name,
                description: gymPlan.description ?? null,
                isFavorite: gymPlan.isFavorite,
                status: 'draft',
                draftTargetGymPlanId: gymPlan.draftTargetGymPlanId ?? null,
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(sections).toHaveLength(gymPlan.sections.length);
            expect(sections[0]).toMatchObject({
                id: gymPlan.sections[0].id,
                sortIndex: 0,
            });

            expect(exercises).toHaveLength(
                gymPlan.sections[0].exercises.length,
            );
            expect(exercises[0]).toMatchObject({
                id: gymPlan.sections[0].exercises[0].id,
                exerciseDefinitionId:
                    gymPlan.sections[0].exercises[0].exerciseDefinitionId,
                sortIndex: 0,
            });
        });

        it('replaces an existing draft with the same id', () => {
            const { gymPlanService } = context.testDb.dbServices;

            const existingDraft = createDraftPlan({
                id: 'draft-plan',
                name: 'Old Draft',
                status: 'draft',
            });

            seedGymPlan(context.testDb, existingDraft);

            const nextDraft = createDraftPlan({
                id: existingDraft.id,
                name: 'Next Draft',
                status: 'active',
            });

            gymPlanService.upsertDraftGymPlan(nextDraft);

            const draft = readGymPlanRowOrThrow(
                context.testDb,
                existingDraft.id,
            );

            expect(draft).toMatchObject({
                id: nextDraft.id,
                name: nextDraft.name,
                status: 'draft',
                createdAtMs: existingDraft.createdAtMs,
                updatedAtMs: FIXED_NOW_MS,
            });
        });

        it('deletes the previous draft when replacing it with a different draft id', () => {
            const { gymPlanService } = context.testDb.dbServices;

            const existingDraft = createDraftPlan({
                id: 'old-draft-plan',
                name: 'Old Draft',
                status: 'draft',
            });

            seedGymPlan(context.testDb, existingDraft);

            const nextDraft = createDraftPlan({
                id: 'new-draft-plan',
                name: 'New Draft',
                status: 'active',
            });

            gymPlanService.upsertDraftGymPlan(nextDraft);

            const oldDraft = context.testDb.db
                .select()
                .from(gymPlansTable)
                .where(eq(gymPlansTable.id, existingDraft.id))
                .get();

            const newDraft = readGymPlanRowOrThrow(
                context.testDb,
                nextDraft.id,
            );

            expect(oldDraft).toBeUndefined();

            expect(newDraft).toMatchObject({
                id: nextDraft.id,
                name: nextDraft.name,
                status: 'draft',
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });
        });

        it('preserves the previous draft target when the next draft does not provide one', () => {
            const { gymPlanService } = context.testDb.dbServices;

            const targetPlan = createDraftPlan({
                id: 'target-plan',
                status: 'active',
            });

            seedGymPlan(context.testDb, targetPlan);

            const existingDraft = createDraftPlan({
                id: 'existing-draft-plan',
                status: 'draft',
                draftTargetGymPlanId: targetPlan.id,
            });

            seedGymPlan(context.testDb, existingDraft);

            const nextDraft = createDraftPlan({
                id: existingDraft.id,
                draftTargetGymPlanId: undefined,
            });

            gymPlanService.upsertDraftGymPlan(nextDraft);

            const draft = readGymPlanRowOrThrow(context.testDb, nextDraft.id);

            expect(draft).toMatchObject({
                id: nextDraft.id,
                status: 'draft',
                draftTargetGymPlanId: targetPlan.id,
                createdAtMs: existingDraft.createdAtMs,
                updatedAtMs: FIXED_NOW_MS,
            });
        });
    });

    describe('commitGymPlanDraft', () => {
        it('persists a new full aggregate with clock timestamps and normalized sort indexes', () => {
            const { gymPlanService } = context.testDb.dbServices;
            const press = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-upsert-press',
                    name: 'Gym Plan Upsert Press',
                    availability: 'gym',
                }),
            );
            const curl = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-upsert-curl',
                    name: 'Gym Plan Upsert Curl',
                    availability: 'both',
                }),
            );
            const draftGymPlan = createGymPlanFixture({
                id: 'upserted-plan',
                name: '  Upper Day  ',
                description: 'strength focus',
                isFavorite: true,
                status: 'draft',
                sections: [
                    createGymPlanSectionFixture({
                        id: 'upserted-section-a',
                        sortIndex: 50,
                        title: 'Main',
                        exercises: [
                            createGymPlanExerciseFixture({
                                id: 'upserted-curl',
                                exerciseDefinitionId: curl.id,
                                sortIndex: 10,
                                targetSetDrafts: [
                                    createGymPlanExerciseTargetSetFixture({
                                        id: 'upserted-curl-target-1',
                                        reps: 12,
                                        rpeTenths: 75,
                                    }),
                                ],
                            }),
                            createGymPlanExerciseFixture({
                                id: 'upserted-press',
                                exerciseDefinitionId: press.id,
                                sortIndex: 20,
                                targetSetDrafts: [
                                    createGymPlanExerciseTargetSetFixture({
                                        id: 'upserted-press-target-1',
                                        reps: 4,
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            });

            seedGymPlan(context.testDb, draftGymPlan);

            gymPlanService.commitGymPlanDraft();

            const row = readGymPlanRowOrThrow(context.testDb, 'upserted-plan');
            const sections = readGymPlanSections(context.testDb, row.id);
            const exercises = readGymPlanExercises(
                context.testDb,
                sections[0].id,
            );
            const curlTargetSets = readGymPlanExerciseTargetSets(
                context.testDb,
                'upserted-curl',
            );

            expect(row).toMatchObject({
                id: draftGymPlan.id,
                name: draftGymPlan.name?.trim(),
                description: draftGymPlan.description ?? null,
                isFavorite: draftGymPlan.isFavorite,
                status: 'active',
                createdAtMs: draftGymPlan.createdAtMs,
                updatedAtMs: FIXED_NOW_MS,
            });
            expect(sections).toHaveLength(draftGymPlan.sections.length);

            sections.forEach((section, sectionIndex) => {
                const expectedSection = draftGymPlan.sections[sectionIndex];

                expect(section).toMatchObject({
                    id: expectedSection.id,
                    title: expectedSection.title ?? null,
                    sortIndex: sectionIndex,
                    createdAtMs: FIXED_NOW_MS,
                    updatedAtMs: FIXED_NOW_MS,
                });
            });

            expect(exercises).toHaveLength(
                draftGymPlan.sections[0].exercises.length,
            );

            exercises.forEach((exercise, exerciseIndex) => {
                const expectedExercise =
                    draftGymPlan.sections[0].exercises[exerciseIndex];

                expect(exercise).toMatchObject({
                    id: expectedExercise.id,
                    exerciseDefinitionId: expectedExercise.exerciseDefinitionId,
                    notes: expectedExercise.notes ?? null,
                    sortIndex: exerciseIndex,
                    createdAtMs: FIXED_NOW_MS,
                    updatedAtMs: FIXED_NOW_MS,
                });
            });

            expect(curlTargetSets).toHaveLength(1);

            expect(curlTargetSets[0]).toMatchObject({
                id: draftGymPlan.sections[0].exercises[0].targetSetDrafts?.[0]
                    ?.id,
                reps: draftGymPlan.sections[0].exercises[0].targetSetDrafts?.[0]
                    ?.reps,
                rpeTenths:
                    draftGymPlan.sections[0].exercises[0].targetSetDrafts?.[0]
                        ?.rpeTenths,
                setIndex: 0,
                createdAtMs: FIXED_NOW_MS,
                updatedAtMs: FIXED_NOW_MS,
            });
        });

        it('replaces an existing aggregate without changing unrelated plans', () => {
            const { gymPlanService } = context.testDb.dbServices;

            const press = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-replace-press',
                    name: 'Gym Plan Replace Press',
                    availability: 'gym',
                }),
            );

            const row = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-replace-row',
                    name: 'Gym Plan Replace Row',
                    availability: 'gym',
                }),
            );

            const existingGymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'existing-plan',
                    name: 'Existing Plan',
                    sections: [
                        createGymPlanSectionFixture({
                            id: 'old-section',
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'old-exercise',
                                    exerciseDefinitionId: press.id,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const unrelatedGymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'unrelated-plan',
                    name: 'Unrelated Plan',
                    sections: [
                        createGymPlanSectionFixture({
                            id: 'unrelated-section',
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'unrelated-exercise',
                                    exerciseDefinitionId: press.id,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            const draftGymPlan = createGymPlanFixture({
                id: 'existing-plan-draft',
                draftTargetGymPlanId: existingGymPlan.id,
                name: 'Updated Plan',
                status: 'draft',
                sections: [
                    createGymPlanSectionFixture({
                        id: 'new-section',
                        exercises: [
                            createGymPlanExerciseFixture({
                                id: 'new-exercise',
                                exerciseDefinitionId: row.id,
                            }),
                        ],
                    }),
                ],
            });

            seedGymPlan(context.testDb, draftGymPlan);

            gymPlanService.commitGymPlanDraft();

            const oldSection = context.testDb.db
                .select()
                .from(gymPlanSectionsTable)
                .where(eq(gymPlanSectionsTable.id, 'old-section'))
                .get();

            const updatedPlanRow = readGymPlanRowOrThrow(
                context.testDb,
                existingGymPlan.id,
            );

            const updatedSections = readGymPlanSections(
                context.testDb,
                existingGymPlan.id,
            );

            const updatedExercises = readGymPlanExercises(
                context.testDb,
                updatedSections[0].id,
            );

            const unrelatedSections = readGymPlanSections(
                context.testDb,
                unrelatedGymPlan.id,
            );

            expect(oldSection).toBeUndefined();

            expect(updatedPlanRow).toMatchObject({
                id: existingGymPlan.id,
                name: draftGymPlan.name,
                status: 'active',
                updatedAtMs: FIXED_NOW_MS,
            });

            expect(updatedSections).toHaveLength(draftGymPlan.sections.length);
            expect(updatedSections[0]).toMatchObject({
                id: draftGymPlan.sections[0].id,
                sortIndex: 0,
            });

            expect(updatedExercises).toHaveLength(
                draftGymPlan.sections[0].exercises.length,
            );

            expect(updatedExercises[0]).toMatchObject({
                id: draftGymPlan.sections[0].exercises[0].id,
                exerciseDefinitionId:
                    draftGymPlan.sections[0].exercises[0].exerciseDefinitionId,
                sortIndex: 0,
            });

            expect(unrelatedSections.map((section) => section.id)).toEqual([
                unrelatedGymPlan.sections[0].id,
            ]);
        });

        it('rejects draft plans with invalid names', () => {
            const { gymPlanService } = context.testDb.dbServices;

            seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'blank-name-plan',
                    name: '   ',
                    status: 'draft',
                    sections: [],
                }),
            );

            expectGymErrorCode(() => {
                gymPlanService.commitGymPlanDraft();
            }, 'INVALID_GYM_PLAN');
        });
    });

    describe('toggleFavorite', () => {
        it('updates the favorite state and timestamp', () => {
            const { gymPlanService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-favorite-plan',
                    name: 'Gym Plan Favorite Press',
                    availability: 'gym',
                }),
            );
            const gymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'favorite-toggle-plan',
                    isFavorite: false,
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

            gymPlanService.toggleFavorite(gymPlan.id);

            expect(
                readGymPlanRowOrThrow(context.testDb, gymPlan.id),
            ).toMatchObject({
                isFavorite: true,
                updatedAtMs: FIXED_NOW_MS,
            });
        });
    });

    describe('archiveGymPlan', () => {
        it('marks the plan as archived', () => {
            const { gymPlanService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-archive-plan',
                    availability: 'gym',
                }),
            );

            const gymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'archive-plan',
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

            gymPlanService.archiveGymPlan(gymPlan.id);

            const archivedPlan = readGymPlanRowOrThrow(
                context.testDb,
                gymPlan.id,
            );

            expect(archivedPlan).toMatchObject({
                id: gymPlan.id,
                status: 'archived',
                updatedAtMs: FIXED_NOW_MS,
            });
        });
    });

    describe('restoreGymPlan', () => {
        it('marks the plan as active', () => {
            const { gymPlanService } = context.testDb.dbServices;

            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-restore-plan',
                    name: 'Gym Plan Restore Press',
                    availability: 'gym',
                }),
            );

            const gymPlan = seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'restore-plan',
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

            gymPlanService.restoreGymPlan(gymPlan.id);

            const restoredPlan = readGymPlanRowOrThrow(
                context.testDb,
                gymPlan.id,
            );

            expect(restoredPlan).toMatchObject({
                id: gymPlan.id,
                status: 'active',
                updatedAtMs: FIXED_NOW_MS,
            });
        });
    });

    describe('deleteGymPlan', () => {
        it('hard-deletes the plan and cascades its sections and exercises', () => {
            const { gymPlanService } = context.testDb.dbServices;
            const definition = seedExerciseDefinition(
                context.testDb,
                createExerciseDefinitionFixture({
                    id: 'definition-delete-plan',
                    name: 'Gym Plan Delete Press',
                    availability: 'gym',
                }),
            );
            seedGymPlan(
                context.testDb,
                createGymPlanFixture({
                    id: 'delete-plan',
                    sections: [
                        createGymPlanSectionFixture({
                            id: 'delete-section',
                            exercises: [
                                createGymPlanExerciseFixture({
                                    id: 'delete-exercise',
                                    exerciseDefinitionId: definition.id,
                                }),
                            ],
                        }),
                    ],
                }),
            );

            gymPlanService.deleteGymPlan('delete-plan');

            expect(
                context.testDb.db
                    .select()
                    .from(gymPlansTable)
                    .where(eq(gymPlansTable.id, 'delete-plan'))
                    .get(),
            ).toBeUndefined();
            expect(readGymPlanSections(context.testDb, 'delete-plan')).toEqual(
                [],
            );
            expect(
                context.testDb.db
                    .select()
                    .from(gymPlanExercisesTable)
                    .where(eq(gymPlanExercisesTable.id, 'delete-exercise'))
                    .get(),
            ).toBeUndefined();
        });
    });
});
