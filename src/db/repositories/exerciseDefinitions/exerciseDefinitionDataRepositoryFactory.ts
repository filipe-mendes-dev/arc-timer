import { eq } from 'drizzle-orm';

import type {
    ExerciseDefinitionData,
    ExerciseDefinitionTargetSetData,
    ExerciseTrackingField,
} from '@src/core/entities/exerciseDefinition.interfaces';

import {
    exerciseDefinitionDataTable,
    exerciseDefinitionDefaultTrackingFieldsTable,
} from '../../schema';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';

type ExerciseDefinitionDataRow =
    typeof exerciseDefinitionDataTable.$inferSelect;
type ExerciseDefinitionDataInsert =
    typeof exerciseDefinitionDataTable.$inferInsert;
type ExerciseDefinitionDefaultTrackingFieldsRow =
    typeof exerciseDefinitionDefaultTrackingFieldsTable.$inferSelect;
type ExerciseDefinitionDefaultTrackingFieldsInsert =
    typeof exerciseDefinitionDefaultTrackingFieldsTable.$inferInsert;

interface DefaultTrackingFieldValues {
    distanceMeters: number | null;
    durationSec: number | null;
    reps: number | null;
    rpeTenths: number | null;
    weightGrams: number | null;
}

export interface UpsertExerciseDefinitionDataInput {
    defaultTargetSet?: ExerciseDefinitionTargetSetData;
    defaultTrackingFields: ExerciseTrackingField[];
    exerciseDefinitionId: string;
    notes?: string;
    updatedAtMs: number;
}

export interface ExerciseDefinitionDataRepository {
    getByExerciseDefinitionId: (
        exerciseDefinitionId: string,
    ) => ExerciseDefinitionData | null;
    upsert: (
        input: UpsertExerciseDefinitionDataInput,
    ) => ExerciseDefinitionData;
    deleteByExerciseDefinitionId: (exerciseDefinitionId: string) => void;
}

export interface CreateExerciseDefinitionDataRepositoryArgs {
    db: RepositoryDb;
}

const trackingFields: ExerciseTrackingField[] = [
    'reps',
    'weight',
    'duration',
    'distance',
    'rpe',
];

const normalizeTrackingFields = (
    fields: readonly ExerciseTrackingField[],
): ExerciseTrackingField[] =>
    trackingFields.filter((field) => fields.includes(field));

const targetSetFromRow = (
    trackingFieldsRow: ExerciseDefinitionDefaultTrackingFieldsRow | null,
): ExerciseDefinitionTargetSetData | undefined => {
    const targetSet: ExerciseDefinitionTargetSetData = {
        reps: trackingFieldsRow?.reps ?? undefined,
        weightGrams: trackingFieldsRow?.weightGrams ?? undefined,
        durationSec: trackingFieldsRow?.durationSec ?? undefined,
        distanceMeters: trackingFieldsRow?.distanceMeters ?? undefined,
        rpeTenths: trackingFieldsRow?.rpeTenths ?? undefined,
    };

    const hasValue =
        targetSet.reps !== undefined ||
        targetSet.weightGrams !== undefined ||
        targetSet.durationSec !== undefined ||
        targetSet.distanceMeters !== undefined ||
        targetSet.rpeTenths !== undefined;

    if (!hasValue) return undefined;

    return targetSet;
};

const trackingFieldsFromRow = (
    trackingFieldsRow: ExerciseDefinitionDefaultTrackingFieldsRow | null,
): ExerciseTrackingField[] => {
    const fields: ExerciseTrackingField[] = [];
    if (
        trackingFieldsRow?.reps !== null &&
        trackingFieldsRow?.reps !== undefined
    ) {
        fields.push('reps');
    }
    if (
        trackingFieldsRow?.weightGrams !== null &&
        trackingFieldsRow?.weightGrams !== undefined
    ) {
        fields.push('weight');
    }
    if (
        trackingFieldsRow?.durationSec !== null &&
        trackingFieldsRow?.durationSec !== undefined
    ) {
        fields.push('duration');
    }
    if (
        trackingFieldsRow?.distanceMeters !== null &&
        trackingFieldsRow?.distanceMeters !== undefined
    ) {
        fields.push('distance');
    }
    if (
        trackingFieldsRow?.rpeTenths !== null &&
        trackingFieldsRow?.rpeTenths !== undefined
    ) {
        fields.push('rpe');
    }

    return fields;
};

const exerciseDefinitionDataFromRow = (
    row: ExerciseDefinitionDataRow,
    defaultTrackingFieldsRow: ExerciseDefinitionDefaultTrackingFieldsRow | null,
): ExerciseDefinitionData => ({
    exerciseDefinitionId: row.exerciseDefinitionId,
    defaultTrackingFields: trackingFieldsFromRow(defaultTrackingFieldsRow),
    defaultTargetSet: targetSetFromRow(defaultTrackingFieldsRow),
    notes: row.notes ?? undefined,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
});

export const createExerciseDefinitionDataRepository = ({
    db,
}: CreateExerciseDefinitionDataRepositoryArgs): ExerciseDefinitionDataRepository => {
    const getDefaultTrackingFieldsRow = (
        exerciseDefinitionId: string,
    ): ExerciseDefinitionDefaultTrackingFieldsRow | null => {
        const row = db
            .select()
            .from(exerciseDefinitionDefaultTrackingFieldsTable)
            .where(
                eq(
                    exerciseDefinitionDefaultTrackingFieldsTable.exerciseDefinitionId,
                    exerciseDefinitionId,
                ),
            )
            .get();

        return row ?? null;
    };

    const repository: ExerciseDefinitionDataRepository = {
        getByExerciseDefinitionId: (
            exerciseDefinitionId: string,
        ): ExerciseDefinitionData | null => {
            const row = db
                .select()
                .from(exerciseDefinitionDataTable)
                .where(
                    eq(
                        exerciseDefinitionDataTable.exerciseDefinitionId,
                        exerciseDefinitionId,
                    ),
                )
                .get();

            return row
                ? exerciseDefinitionDataFromRow(
                      row,
                      getDefaultTrackingFieldsRow(exerciseDefinitionId),
                  )
                : null;
        },

        upsert: ({
            defaultTargetSet,
            defaultTrackingFields,
            exerciseDefinitionId,
            notes,
            updatedAtMs,
        }: UpsertExerciseDefinitionDataInput): ExerciseDefinitionData => {
            const existing =
                repository.getByExerciseDefinitionId(exerciseDefinitionId);
            const normalizedTrackingFields = normalizeTrackingFields(
                defaultTrackingFields,
            );
            const row: ExerciseDefinitionDataInsert = {
                exerciseDefinitionId,
                notes: notes ?? null,
                createdAtMs: existing?.createdAtMs ?? updatedAtMs,
                updatedAtMs,
            };
            const existingTrackingFieldsRow =
                getDefaultTrackingFieldsRow(exerciseDefinitionId);
            const trackingFieldValues: DefaultTrackingFieldValues = {
                reps: null,
                weightGrams: null,
                durationSec: null,
                distanceMeters: null,
                rpeTenths: null,
            };

            if (normalizedTrackingFields.includes('reps')) {
                trackingFieldValues.reps = defaultTargetSet?.reps ?? null;
            }

            if (normalizedTrackingFields.includes('weight')) {
                trackingFieldValues.weightGrams =
                    defaultTargetSet?.weightGrams ?? null;
            }

            if (normalizedTrackingFields.includes('duration')) {
                trackingFieldValues.durationSec =
                    defaultTargetSet?.durationSec ?? null;
            }

            if (normalizedTrackingFields.includes('distance')) {
                trackingFieldValues.distanceMeters =
                    defaultTargetSet?.distanceMeters ?? null;
            }

            if (normalizedTrackingFields.includes('rpe')) {
                trackingFieldValues.rpeTenths =
                    defaultTargetSet?.rpeTenths ?? null;
            }
            const trackingFieldsRow: ExerciseDefinitionDefaultTrackingFieldsInsert =
                {
                    exerciseDefinitionId,
                    ...trackingFieldValues,
                    createdAtMs:
                        existingTrackingFieldsRow?.createdAtMs ?? updatedAtMs,
                    updatedAtMs,
                };

            db.transaction((tx) => {
                tx.insert(exerciseDefinitionDataTable)
                    .values(row)
                    .onConflictDoUpdate({
                        target: exerciseDefinitionDataTable.exerciseDefinitionId,
                        set: {
                            notes: row.notes,
                            updatedAtMs: row.updatedAtMs,
                        },
                    })
                    .run();
                tx.insert(exerciseDefinitionDefaultTrackingFieldsTable)
                    .values(trackingFieldsRow)
                    .onConflictDoUpdate({
                        target: exerciseDefinitionDefaultTrackingFieldsTable.exerciseDefinitionId,
                        set: {
                            reps: trackingFieldsRow.reps,
                            weightGrams: trackingFieldsRow.weightGrams,
                            durationSec: trackingFieldsRow.durationSec,
                            distanceMeters: trackingFieldsRow.distanceMeters,
                            rpeTenths: trackingFieldsRow.rpeTenths,
                            updatedAtMs: trackingFieldsRow.updatedAtMs,
                        },
                    })
                    .run();
            });
            const dataRow: ExerciseDefinitionDataRow = {
                exerciseDefinitionId,
                notes: row.notes ?? null,
                createdAtMs: row.createdAtMs,
                updatedAtMs: row.updatedAtMs,
            };

            return {
                exerciseDefinitionId,
                defaultTrackingFields: trackingFieldsFromRow({
                    exerciseDefinitionId,
                    ...trackingFieldValues,
                    createdAtMs: trackingFieldsRow.createdAtMs,
                    updatedAtMs: trackingFieldsRow.updatedAtMs,
                }),
                defaultTargetSet: targetSetFromRow({
                    exerciseDefinitionId,
                    ...trackingFieldValues,
                    createdAtMs: trackingFieldsRow.createdAtMs,
                    updatedAtMs: trackingFieldsRow.updatedAtMs,
                }),
                notes: dataRow.notes ?? undefined,
                createdAtMs: row.createdAtMs,
                updatedAtMs,
            };
        },

        deleteByExerciseDefinitionId: (exerciseDefinitionId: string): void => {
            db.transaction((tx) => {
                tx.delete(exerciseDefinitionDefaultTrackingFieldsTable)
                    .where(
                        eq(
                            exerciseDefinitionDefaultTrackingFieldsTable.exerciseDefinitionId,
                            exerciseDefinitionId,
                        ),
                    )
                    .run();
                tx.delete(exerciseDefinitionDataTable)
                    .where(
                        eq(
                            exerciseDefinitionDataTable.exerciseDefinitionId,
                            exerciseDefinitionId,
                        ),
                    )
                    .run();
            });
        },
    };

    return repository;
};
