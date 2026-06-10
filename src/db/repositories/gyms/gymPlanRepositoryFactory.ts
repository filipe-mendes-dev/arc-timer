import { asc, desc, eq, inArray, ne } from 'drizzle-orm';

import type {
    GymPlan,
    GymPlanExercise,
    GymPlanExerciseTargetSet,
    GymPlanListItem,
    GymPlanSection,
} from '@src/core/entities/gymPlan.interfaces';

import {
    gymPlanExerciseTargetSetsTable,
    gymPlanExercisesTable,
    gymPlansTable,
    gymPlanSectionsTable,
} from '../../schema';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';

export type GymPlanRow = typeof gymPlansTable.$inferSelect;
export type GymPlanSectionRow = typeof gymPlanSectionsTable.$inferSelect;
export type GymPlanExerciseRow = typeof gymPlanExercisesTable.$inferSelect;
export type GymPlanExerciseTargetSetRow =
    typeof gymPlanExerciseTargetSetsTable.$inferSelect;
type GymPlanInsert = typeof gymPlansTable.$inferInsert;
type GymPlanSectionInsert = typeof gymPlanSectionsTable.$inferInsert;
type GymPlanExerciseInsert = typeof gymPlanExercisesTable.$inferInsert;
type GymPlanExerciseTargetSetInsert =
    typeof gymPlanExerciseTargetSetsTable.$inferInsert;

export interface ListGymPlansInput {
    includeArchived?: boolean;
}

export interface InsertGymPlanInput extends GymPlanInsert {}

export interface UpdateGymPlanInput
    extends
        Pick<GymPlanRow, 'id' | 'updatedAtMs'>,
        Partial<
            Pick<
                GymPlanRow,
                | 'description'
                | 'draftTargetGymPlanId'
                | 'isFavorite'
                | 'name'
                | 'status'
            >
        > {}

export interface ReplaceGymPlanSectionsInput {
    exercises: GymPlanExerciseInsert[];
    gymPlanId: string;
    sections: GymPlanSectionInsert[];
    targetSets: GymPlanExerciseTargetSetInsert[];
}

export interface GymPlanRepository {
    listGymPlanItems: (input?: ListGymPlansInput) => GymPlanListItem[];
    getById: (id: string) => GymPlan | null;
    getDraft: () => GymPlan | null;
    getGymPlanRow: (id: string) => GymPlanRow | null;
    hasGymPlan: (id: string) => boolean;
    insertGymPlan: (input: InsertGymPlanInput) => void;
    updateGymPlan: (input: UpdateGymPlanInput) => void;
    replaceGymPlanSections: (input: ReplaceGymPlanSectionsInput) => void;
    deleteGymPlan: (id: string) => void;
}

export interface CreateGymPlanRepositoryArgs {
    db: RepositoryDb;
}

const assertNonEmptyId = (id: string, fieldName: string): void => {
    if (id.trim().length === 0) {
        throw new Error(`${fieldName} cannot be blank`);
    }
};

const assertFiniteTimestamp = (value: number, fieldName: string): void => {
    if (!Number.isFinite(value)) {
        throw new Error(`${fieldName} must be finite`);
    }
};

const assertIntegerAtLeast = (
    value: number,
    minimum: number,
    fieldName: string,
): void => {
    if (!Number.isInteger(value) || value < minimum) {
        throw new Error(`${fieldName} must be an integer >= ${minimum}`);
    }
};

const assertOptionalIntegerAtLeast = (
    value: number | null | undefined,
    minimum: number,
    fieldName: string,
): void => {
    if (value !== undefined && value !== null) {
        assertIntegerAtLeast(value, minimum, fieldName);
    }
};

const assertOptionalIntegerBetween = (
    value: number | null | undefined,
    minimum: number,
    maximum: number,
    fieldName: string,
): void => {
    if (
        value !== undefined &&
        value !== null &&
        (!Number.isInteger(value) || value < minimum || value > maximum)
    ) {
        throw new Error(
            `${fieldName} must be an integer between ${minimum} and ${maximum}`,
        );
    }
};

const gymPlanExerciseTargetSetFromRow = (
    row: GymPlanExerciseTargetSetRow,
): GymPlanExerciseTargetSet => ({
    id: row.id,
    setIndex: row.setIndex,
    reps: row.reps ?? undefined,
    weightGrams: row.weightGrams ?? undefined,
    durationSec: row.durationSec ?? undefined,
    distanceMeters: row.distanceMeters ?? undefined,
    rpeTenths: row.rpeTenths ?? undefined,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

const gymPlanExerciseFromRow = (
    row: GymPlanExerciseRow,
    targetSets: GymPlanExerciseTargetSet[],
): GymPlanExercise => ({
    id: row.id,
    exerciseDefinitionId: row.exerciseDefinitionId,
    sortIndex: row.sortIndex,
    notes: row.notes ?? undefined,
    targetSetDrafts: targetSets,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

const gymPlanSectionFromRow = (
    row: GymPlanSectionRow,
    exercises: GymPlanExercise[],
): GymPlanSection => ({
    id: row.id,
    title: row.title ?? undefined,
    sortIndex: row.sortIndex,
    exercises,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

const gymPlanFromRow = (
    row: GymPlanRow,
    sections: GymPlanSection[],
): GymPlan => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    sections,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
    isFavorite: row.isFavorite,
    status: row.status,
    sectionCount: sections.length,
    exerciseCount: sections.reduce(
        (total, section) => total + section.exercises.length,
        0,
    ),
    draftTargetGymPlanId: row.draftTargetGymPlanId ?? undefined,
});

const gymPlanListItemFromRow = (
    row: GymPlanRow,
    counts: { exerciseCount: number; sectionCount: number },
): GymPlanListItem => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
    isFavorite: row.isFavorite,
    status: row.status,
    sectionCount: counts.sectionCount,
    exerciseCount: counts.exerciseCount,
});

export const createGymPlanRepository = ({
    db,
}: CreateGymPlanRepositoryArgs): GymPlanRepository => {
    const getStatusFilter = (includeArchived: boolean) => {
        if (includeArchived) {
            return ne(gymPlansTable.status, 'draft');
        }

        return eq(gymPlansTable.status, 'active');
    };

    const getSectionsByPlanIds = (
        gymPlanIds: string[],
    ): Map<string, GymPlanSection[]> => {
        if (gymPlanIds.length === 0) return new Map<string, GymPlanSection[]>();

        const sectionRows = db
            .select()
            .from(gymPlanSectionsTable)
            .where(inArray(gymPlanSectionsTable.gymPlanId, gymPlanIds))
            .orderBy(asc(gymPlanSectionsTable.sortIndex))
            .all();
        if (sectionRows.length === 0) {
            return new Map(gymPlanIds.map((id) => [id, []]));
        }

        const exerciseRows = db
            .select()
            .from(gymPlanExercisesTable)
            .where(
                inArray(
                    gymPlanExercisesTable.gymPlanSectionId,
                    sectionRows.map((section) => section.id),
                ),
            )
            .orderBy(asc(gymPlanExercisesTable.sortIndex))
            .all();
        const targetSetRows =
            exerciseRows.length > 0
                ? db
                      .select()
                      .from(gymPlanExerciseTargetSetsTable)
                      .where(
                          inArray(
                              gymPlanExerciseTargetSetsTable.gymPlanExerciseId,
                              exerciseRows.map((exercise) => exercise.id),
                          ),
                      )
                      .orderBy(asc(gymPlanExerciseTargetSetsTable.setIndex))
                      .all()
                : [];
        const exercisesBySectionId = new Map<string, GymPlanExercise[]>();
        const targetSetsByExerciseId = new Map<
            string,
            GymPlanExerciseTargetSet[]
        >();

        targetSetRows.forEach((targetSet) => {
            const targetSets =
                targetSetsByExerciseId.get(targetSet.gymPlanExerciseId) ?? [];
            targetSets.push(gymPlanExerciseTargetSetFromRow(targetSet));
            targetSetsByExerciseId.set(targetSet.gymPlanExerciseId, targetSets);
        });

        exerciseRows.forEach((exercise) => {
            const exercises =
                exercisesBySectionId.get(exercise.gymPlanSectionId) ?? [];
            exercises.push(
                gymPlanExerciseFromRow(
                    exercise,
                    targetSetsByExerciseId.get(exercise.id) ?? [],
                ),
            );
            exercisesBySectionId.set(exercise.gymPlanSectionId, exercises);
        });

        const sectionsByPlanId = new Map<string, GymPlanSection[]>(
            gymPlanIds.map((id) => [id, []]),
        );
        sectionRows.forEach((section) => {
            const sections = sectionsByPlanId.get(section.gymPlanId) ?? [];
            sections.push(
                gymPlanSectionFromRow(
                    section,
                    exercisesBySectionId.get(section.id) ?? [],
                ),
            );
            sectionsByPlanId.set(section.gymPlanId, sections);
        });

        return sectionsByPlanId;
    };

    const getListCountsByPlanIds = (
        gymPlanIds: string[],
    ): Map<string, { exerciseCount: number; sectionCount: number }> => {
        const countsByPlanId = new Map(
            gymPlanIds.map((id) => [id, { exerciseCount: 0, sectionCount: 0 }]),
        );
        if (gymPlanIds.length === 0) return countsByPlanId;

        const sectionRows = db
            .select({
                id: gymPlanSectionsTable.id,
                gymPlanId: gymPlanSectionsTable.gymPlanId,
            })
            .from(gymPlanSectionsTable)
            .where(inArray(gymPlanSectionsTable.gymPlanId, gymPlanIds))
            .all();

        sectionRows.forEach((section) => {
            const counts = countsByPlanId.get(section.gymPlanId);
            if (!counts) return;

            counts.sectionCount += 1;
        });

        if (sectionRows.length === 0) return countsByPlanId;

        const planIdBySectionId = new Map(
            sectionRows.map((section) => [section.id, section.gymPlanId]),
        );
        const exerciseRows = db
            .select({
                gymPlanSectionId: gymPlanExercisesTable.gymPlanSectionId,
            })
            .from(gymPlanExercisesTable)
            .where(
                inArray(
                    gymPlanExercisesTable.gymPlanSectionId,
                    sectionRows.map((section) => section.id),
                ),
            )
            .all();

        exerciseRows.forEach((exercise) => {
            const planId = planIdBySectionId.get(exercise.gymPlanSectionId);
            if (!planId) return;

            const counts = countsByPlanId.get(planId);
            if (!counts) return;

            counts.exerciseCount += 1;
        });

        return countsByPlanId;
    };

    const assertSectionInput = (input: GymPlanSectionInsert): void => {
        assertNonEmptyId(input.id, 'Gym plan section ID');
        assertNonEmptyId(input.gymPlanId, 'Gym plan ID');
        assertIntegerAtLeast(input.sortIndex, 0, 'sortIndex');
        assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
        assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
    };

    const assertExerciseInput = (input: GymPlanExerciseInsert): void => {
        assertNonEmptyId(input.id, 'Gym plan exercise ID');
        assertNonEmptyId(input.gymPlanSectionId, 'Gym plan section ID');
        assertNonEmptyId(input.exerciseDefinitionId, 'Exercise definition ID');
        assertIntegerAtLeast(input.sortIndex, 0, 'sortIndex');
        assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
        assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
    };

    const assertTargetSetInput = (
        input: GymPlanExerciseTargetSetInsert,
    ): void => {
        assertNonEmptyId(input.id, 'Gym plan exercise target set ID');
        assertNonEmptyId(input.gymPlanExerciseId, 'Gym plan exercise ID');
        assertIntegerAtLeast(input.setIndex, 0, 'setIndex');
        assertOptionalIntegerAtLeast(input.reps, 1, 'reps');
        assertOptionalIntegerAtLeast(input.weightGrams, 0, 'weightGrams');
        assertOptionalIntegerAtLeast(input.durationSec, 1, 'durationSec');
        assertOptionalIntegerAtLeast(input.distanceMeters, 1, 'distanceMeters');
        assertOptionalIntegerBetween(input.rpeTenths, 0, 100, 'rpeTenths');
        assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
        assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');
    };

    return {
        listGymPlanItems: ({
            includeArchived = false,
        }: ListGymPlansInput = {}): GymPlanListItem[] => {
            const rows = db
                .select()
                .from(gymPlansTable)
                .where(getStatusFilter(includeArchived))
                .orderBy(
                    desc(gymPlansTable.isFavorite),
                    desc(gymPlansTable.updatedAtMs),
                )
                .all();
            const countsByPlanId = getListCountsByPlanIds(
                rows.map((row) => row.id),
            );

            return rows.map((row) =>
                gymPlanListItemFromRow(
                    row,
                    countsByPlanId.get(row.id) ?? {
                        exerciseCount: 0,
                        sectionCount: 0,
                    },
                ),
            );
        },

        getById: (id: string): GymPlan | null => {
            assertNonEmptyId(id, 'Gym plan ID');

            const row = db
                .select()
                .from(gymPlansTable)
                .where(eq(gymPlansTable.id, id))
                .get();

            if (!row || row.status === 'draft') return null;

            return gymPlanFromRow(
                row,
                getSectionsByPlanIds([row.id]).get(row.id) ?? [],
            );
        },

        getDraft: (): GymPlan | null => {
            const row = db
                .select()
                .from(gymPlansTable)
                .where(eq(gymPlansTable.status, 'draft'))
                .get();

            if (!row) return null;

            return gymPlanFromRow(
                row,
                getSectionsByPlanIds([row.id]).get(row.id) ?? [],
            );
        },

        getGymPlanRow: (id: string): GymPlanRow | null => {
            assertNonEmptyId(id, 'Gym plan ID');

            const row = db
                .select()
                .from(gymPlansTable)
                .where(eq(gymPlansTable.id, id))
                .get();

            return row ?? null;
        },

        hasGymPlan: (id: string): boolean => {
            assertNonEmptyId(id, 'Gym plan ID');

            const plan = db
                .select({ id: gymPlansTable.id })
                .from(gymPlansTable)
                .where(eq(gymPlansTable.id, id))
                .limit(1)
                .get();

            return plan !== undefined;
        },

        insertGymPlan: (input: InsertGymPlanInput): void => {
            assertNonEmptyId(input.id, 'Gym plan ID');
            if (input.status !== 'draft' && input.name.trim().length === 0) {
                throw new Error('Gym plan name cannot be blank');
            }
            assertFiniteTimestamp(input.createdAtMs, 'createdAtMs');
            assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');

            db.insert(gymPlansTable)
                .values({
                    createdAtMs: input.createdAtMs,
                    description: input.description ?? null,
                    draftTargetGymPlanId: input.draftTargetGymPlanId ?? null,
                    id: input.id,
                    isFavorite: input.isFavorite ?? false,
                    name: input.name,
                    status: input.status ?? 'active',
                    updatedAtMs: input.updatedAtMs,
                })
                .run();
        },

        updateGymPlan: (input: UpdateGymPlanInput): void => {
            assertNonEmptyId(input.id, 'Gym plan ID');
            if (input.status !== 'draft' && input.name?.trim().length === 0) {
                throw new Error('Gym plan name cannot be blank');
            }
            assertFiniteTimestamp(input.updatedAtMs, 'updatedAtMs');

            db.update(gymPlansTable)
                .set({
                    description: input.description,
                    draftTargetGymPlanId: input.draftTargetGymPlanId,
                    isFavorite: input.isFavorite,
                    name: input.name,
                    status: input.status,
                    updatedAtMs: input.updatedAtMs,
                })
                .where(eq(gymPlansTable.id, input.id))
                .run();
        },

        replaceGymPlanSections: ({
            exercises,
            gymPlanId,
            sections,
            targetSets,
        }: ReplaceGymPlanSectionsInput): void => {
            assertNonEmptyId(gymPlanId, 'Gym plan ID');
            sections.forEach(assertSectionInput);
            exercises.forEach(assertExerciseInput);
            targetSets.forEach(assertTargetSetInput);

            db.transaction((tx) => {
                tx.delete(gymPlanSectionsTable)
                    .where(eq(gymPlanSectionsTable.gymPlanId, gymPlanId))
                    .run();

                if (sections.length > 0) {
                    tx.insert(gymPlanSectionsTable).values(sections).run();
                }

                if (exercises.length > 0) {
                    tx.insert(gymPlanExercisesTable).values(exercises).run();
                }

                if (targetSets.length > 0) {
                    tx.insert(gymPlanExerciseTargetSetsTable)
                        .values(targetSets)
                        .run();
                }
            });
        },

        deleteGymPlan: (id: string): void => {
            assertNonEmptyId(id, 'Gym plan ID');

            db.delete(gymPlansTable).where(eq(gymPlansTable.id, id)).run();
        },
    };
};
