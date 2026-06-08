import { and, asc, eq, exists, like, or } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
    ExerciseDefinitionDeleteBlockReason,
    ExerciseDefinitionListItem,
    ExerciseDefinitionSource,
} from '@src/core/entities/exerciseDefinition.interfaces';
import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';

import {
    exerciseDefinitionsTable,
    gymExerciseRecordsTable,
    gymPlanExercisesTable,
    workoutExercisesTable,
} from '../../schema';
import {
    createExerciseDefinitionError,
    exerciseDefinitionErrors,
} from './exerciseDefinitionErrors';
import type * as schema from '../../schema';
import type { ExerciseDefinitionDataRepository } from './exerciseDefinitionDataRepositoryFactory';
import type { ExerciseDefinitionStatsRepository } from './exerciseDefinitionStatsRepositoryFactory';

export type ExerciseDefinitionRepositoryDb = BaseSQLiteDatabase<
    'sync',
    unknown,
    typeof schema
>;

type ExerciseDefinitionDbInsert = typeof exerciseDefinitionsTable.$inferInsert;
type ExerciseDefinitionDbRow = typeof exerciseDefinitionsTable.$inferSelect;

interface ExerciseDefinitionBaseListItem {
    id: string;
    name: string;
    normalizedName: string;
    source: ExerciseDefinitionSource;
    availability: ExerciseDefinitionAvailability;
    createdAtMs: number;
    updatedAtMs: number;
}

export interface CreateExerciseDefinitionInput {
    availability: ExerciseDefinitionAvailability;
    createdAtMs: number;
    id: string;
    name: string;
    normalizedName: string;
    source: ExerciseDefinitionSource;
    updatedAtMs: number;
}

export interface UpdateExerciseDefinitionInput {
    availability?: ExerciseDefinitionAvailability;
    id: string;
    name?: string;
    normalizedName?: string;
    source?: ExerciseDefinitionSource;
    updatedAtMs: number;
}

export interface ExerciseDefinitionListFilters {
    availability?: ExerciseDefinitionAvailability;
    name?: string;
    namePrefix?: string;
    source?: ExerciseDefinitionSource;
}

export interface ExerciseDefinitionListPagination {
    limit?: number;
}

export type ExerciseDefinitionListScope = 'active' | 'all';

export interface ExerciseDefinitionListParams {
    filters?: ExerciseDefinitionListFilters;
    pagination?: ExerciseDefinitionListPagination;
    scope?: ExerciseDefinitionListScope;
}

export interface ExerciseDefinitionRepository {
    create: (input: CreateExerciseDefinitionInput) => ExerciseDefinition;
    deleteById: (id: string) => void;
    getAll: () => ExerciseDefinitionListItem[];
    getById: (id: string) => ExerciseDefinition | null;
    getByNormalizedName: (normalizedName: string) => ExerciseDefinition | null;
    hasGymSessionExerciseReferences: (id: string) => boolean;
    hasGymPlanExerciseReferences: (id: string) => boolean;
    hasWorkoutExerciseReferences: (id: string) => boolean;
    list: (params?: ExerciseDefinitionListParams) => ExerciseDefinitionListItem[];
    replaceGymPlanExerciseDefinitionReferences: (input: {
        sourceId: string;
        targetId: string;
    }) => void;
    replaceGymSessionExerciseDefinitionReferences: (input: {
        sourceId: string;
        targetId: string;
    }) => void;
    replaceWorkoutExerciseDefinitionReferences: (input: {
        sourceId: string;
        targetId: string;
    }) => void;
    update: (input: UpdateExerciseDefinitionInput) => ExerciseDefinition;
}

export interface CreateExerciseDefinitionRepositoryArgs {
    db: ExerciseDefinitionRepositoryDb;
    exerciseDefinitionDataRepository: ExerciseDefinitionDataRepository;
    exerciseDefinitionStatsRepository: ExerciseDefinitionStatsRepository;
}

const exerciseDefinitionFromRow = (
    row: ExerciseDefinitionDbRow,
): ExerciseDefinitionBaseListItem => ({
    id: row.id,
    name: row.name,
    normalizedName: row.normalizedName,
    source: row.source,
    availability: row.availability,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

const exerciseDefinitionFromListItem = (
    item: ExerciseDefinitionListItem,
    exerciseDefinitionDataRepository: ExerciseDefinitionDataRepository,
    exerciseDefinitionStatsRepository: ExerciseDefinitionStatsRepository,
): ExerciseDefinition => ({
    ...item,
    data:
        exerciseDefinitionDataRepository.getByExerciseDefinitionId(item.id) ??
        undefined,
    stats:
        exerciseDefinitionStatsRepository.getByExerciseDefinitionId(item.id) ??
        undefined,
});

export const createExerciseDefinitionRepository = ({
    db,
    exerciseDefinitionDataRepository,
    exerciseDefinitionStatsRepository,
}: CreateExerciseDefinitionRepositoryArgs): ExerciseDefinitionRepository => {
    const assertUniqueNormalizedName = (
        normalizedName: string,
        existingId?: string,
    ): void => {
        if (normalizedName.length === 0) {
            throw new Error('Exercise definition normalized name cannot be blank');
        }

        const existing = repository.getByNormalizedName(normalizedName);
        if (existing && existing.id !== existingId) {
            throw createExerciseDefinitionError(
                exerciseDefinitionErrors.duplicateName,
            );
        }
    };

    const normalizeLimit = (limit?: number): number | undefined =>
        limit !== undefined && Number.isInteger(limit) && limit > 0
            ? limit
            : undefined;

    const normalizeNameFilter = (name?: string): string | undefined => {
        if (!name) return undefined;

        const normalizedName = normalizeExerciseName(name);

        return normalizedName.length > 0 ? normalizedName : undefined;
    };

    const getDeleteBlockReason = (
        item: ExerciseDefinitionBaseListItem,
    ): ExerciseDefinitionDeleteBlockReason | undefined => {
        if (item.source === 'system') return 'system';

        const hasReferences =
            repository.hasWorkoutExerciseReferences(item.id) ||
            repository.hasGymSessionExerciseReferences(item.id) ||
            repository.hasGymPlanExerciseReferences(item.id);

        return hasReferences ? 'referenced' : undefined;
    };

    const withDeleteMetadata = (
        item: ExerciseDefinitionBaseListItem,
    ): ExerciseDefinitionListItem => {
        const deleteBlockReason = getDeleteBlockReason(item);

        if (deleteBlockReason) {
            return {
                ...item,
                canDelete: false,
                deleteBlockReason,
            };
        }

        return {
            ...item,
            canDelete: true,
        };
    };

    const repository: ExerciseDefinitionRepository = {
        create: (
            input: CreateExerciseDefinitionInput,
        ): ExerciseDefinition => {
            assertUniqueNormalizedName(input.normalizedName);

            const definitionInsert: ExerciseDefinitionDbInsert = input;

            db.insert(exerciseDefinitionsTable)
                .values(definitionInsert)
                .run();

            return exerciseDefinitionFromListItem(
                withDeleteMetadata(input),
                exerciseDefinitionDataRepository,
                exerciseDefinitionStatsRepository,
            );
        },

        deleteById: (id: string): void => {
            db.delete(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.id, id))
                .run();
        },

        getAll: (): ExerciseDefinitionListItem[] =>
            db
                .select()
                .from(exerciseDefinitionsTable)
                .orderBy(asc(exerciseDefinitionsTable.name))
                .all()
                .map((row) => withDeleteMetadata(exerciseDefinitionFromRow(row))),

        getById: (id: string): ExerciseDefinition | null => {
            const row = db
                .select()
                .from(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.id, id))
                .get();

            return row
                ? exerciseDefinitionFromListItem(
                      withDeleteMetadata(exerciseDefinitionFromRow(row)),
                      exerciseDefinitionDataRepository,
                      exerciseDefinitionStatsRepository,
                  )
                : null;
        },

        getByNormalizedName: (
            normalizedName: string,
        ): ExerciseDefinition | null => {
            const row = db
                .select()
                .from(exerciseDefinitionsTable)
                .where(eq(exerciseDefinitionsTable.normalizedName, normalizedName))
                .get();

            return row
                ? exerciseDefinitionFromListItem(
                      withDeleteMetadata(exerciseDefinitionFromRow(row)),
                      exerciseDefinitionDataRepository,
                      exerciseDefinitionStatsRepository,
                  )
                : null;
        },

        hasGymSessionExerciseReferences: (id: string): boolean => {
            const reference = db
                .select({ id: gymExerciseRecordsTable.id })
                .from(gymExerciseRecordsTable)
                .where(eq(gymExerciseRecordsTable.exerciseDefinitionId, id))
                .limit(1)
                .get();

            return reference !== undefined;
        },

        hasGymPlanExerciseReferences: (id: string): boolean => {
            const reference = db
                .select({ id: gymPlanExercisesTable.id })
                .from(gymPlanExercisesTable)
                .where(eq(gymPlanExercisesTable.exerciseDefinitionId, id))
                .limit(1)
                .get();

            return reference !== undefined;
        },

        hasWorkoutExerciseReferences: (id: string): boolean => {
            const reference = db
                .select({ id: workoutExercisesTable.id })
                .from(workoutExercisesTable)
                .where(eq(workoutExercisesTable.exerciseDefinitionId, id))
                .limit(1)
                .get();

            return reference !== undefined;
        },

        list: ({
            filters,
            pagination,
            scope = 'active',
        }: ExerciseDefinitionListParams = {}): ExerciseDefinitionListItem[] => {
            const normalizedNameFilter = normalizeNameFilter(filters?.name);
            const normalizedNamePrefixFilter = normalizeNameFilter(
                filters?.namePrefix,
            );
            const conditions = [
                scope === 'active'
                    ? or(
                          eq(exerciseDefinitionsTable.source, 'user'),
                          exists(
                              db
                                  .select({ id: workoutExercisesTable.id })
                                  .from(workoutExercisesTable)
                                  .where(
                                      eq(
                                          workoutExercisesTable.exerciseDefinitionId,
                                          exerciseDefinitionsTable.id,
                                      ),
                                  ),
                          ),
                          exists(
                              db
                                  .select({ id: gymPlanExercisesTable.id })
                                  .from(gymPlanExercisesTable)
                                  .where(
                                      eq(
                                          gymPlanExercisesTable.exerciseDefinitionId,
                                          exerciseDefinitionsTable.id,
                                      ),
                                  ),
                          ),
                      )
                    : undefined,
                filters?.source
                    ? eq(exerciseDefinitionsTable.source, filters.source)
                    : undefined,
                filters?.availability
                    ? or(
                          eq(exerciseDefinitionsTable.availability, 'both'),
                          eq(
                              exerciseDefinitionsTable.availability,
                              filters.availability,
                          ),
                      )
                    : undefined,
                normalizedNameFilter
                    ? like(
                          exerciseDefinitionsTable.normalizedName,
                          `%${normalizedNameFilter}%`,
                      )
                    : undefined,
                normalizedNamePrefixFilter
                    ? like(
                          exerciseDefinitionsTable.normalizedName,
                          `${normalizedNamePrefixFilter}%`,
                      )
                    : undefined,
            ];
            const whereClause = and(...conditions);
            const query = db
                .select()
                .from(exerciseDefinitionsTable)
                .where(whereClause)
                .orderBy(asc(exerciseDefinitionsTable.name));
            const limit = normalizeLimit(pagination?.limit);
            const rows =
                limit === undefined ? query.all() : query.limit(limit).all();

            return rows.map((row) =>
                withDeleteMetadata(exerciseDefinitionFromRow(row)),
            );
        },

        replaceGymPlanExerciseDefinitionReferences: ({
            sourceId,
            targetId,
        }): void => {
            db.update(gymPlanExercisesTable)
                .set({ exerciseDefinitionId: targetId })
                .where(eq(gymPlanExercisesTable.exerciseDefinitionId, sourceId))
                .run();
        },

        replaceGymSessionExerciseDefinitionReferences: ({
            sourceId,
            targetId,
        }): void => {
            db.update(gymExerciseRecordsTable)
                .set({ exerciseDefinitionId: targetId })
                .where(eq(gymExerciseRecordsTable.exerciseDefinitionId, sourceId))
                .run();
        },

        replaceWorkoutExerciseDefinitionReferences: ({
            sourceId,
            targetId,
        }): void => {
            db.update(workoutExercisesTable)
                .set({ exerciseDefinitionId: targetId })
                .where(eq(workoutExercisesTable.exerciseDefinitionId, sourceId))
                .run();
        },

        update: (
            input: UpdateExerciseDefinitionInput,
        ): ExerciseDefinition => {
            const existing = repository.getById(input.id);
            if (!existing) {
                throw new Error(`Exercise definition ${input.id} was not found`);
            }

            if (
                input.normalizedName !== undefined &&
                input.normalizedName !== existing.normalizedName
            ) {
                assertUniqueNormalizedName(input.normalizedName, input.id);
            }

            const next: ExerciseDefinitionBaseListItem = {
                ...existing,
                name: input.name ?? existing.name,
                normalizedName: input.normalizedName ?? existing.normalizedName,
                source: input.source ?? existing.source,
                availability: input.availability ?? existing.availability,
                updatedAtMs: input.updatedAtMs,
            };
            const updateValues: Partial<ExerciseDefinitionDbInsert> = {
                name: next.name,
                normalizedName: next.normalizedName,
                source: next.source,
                availability: next.availability,
                updatedAtMs: next.updatedAtMs,
            };

            db.update(exerciseDefinitionsTable)
                .set(updateValues)
                .where(eq(exerciseDefinitionsTable.id, input.id))
                .run();

            return exerciseDefinitionFromListItem(
                withDeleteMetadata(next),
                exerciseDefinitionDataRepository,
                exerciseDefinitionStatsRepository,
            );
        },
    };

    return repository;
};
