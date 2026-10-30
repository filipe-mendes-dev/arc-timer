import { eq, sql } from 'drizzle-orm';
import type { BackupTablesV1 } from '@src/core/backup/backupTypes';
import {
    exerciseDefinitionsTable,
    exerciseDefinitionDataTable,
    exerciseDefinitionDefaultTrackingFieldsTable,
    workoutVersionsTable,
    workoutsTable,
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    gymPlansTable,
    gymPlanSectionsTable,
    gymPlanExercisesTable,
    gymPlanExerciseTargetSetsTable,
    gymSessionsTable,
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    exerciseDefinitionStatsTable,
    exerciseDefinitionRecentGymSessionsTable,
} from '../../schema';
import type { RepositoryDb } from '../workouts/workoutRepositoryFactory';

export const backupTables = {
    exerciseDefinitions: exerciseDefinitionsTable,
    exerciseDefinitionData: exerciseDefinitionDataTable,
    exerciseDefinitionDefaultTrackingFields: exerciseDefinitionDefaultTrackingFieldsTable,
    workoutVersions: workoutVersionsTable,
    workouts: workoutsTable,
    workoutBlocks: workoutBlocksTable,
    workoutExercises: workoutExercisesTable,
    workoutSessions: workoutSessionsTable,
    gymPlans: gymPlansTable,
    gymPlanSections: gymPlanSectionsTable,
    gymPlanExercises: gymPlanExercisesTable,
    gymPlanExerciseTargetSets: gymPlanExerciseTargetSetsTable,
    gymSessions: gymSessionsTable,
    gymExerciseRecords: gymExerciseRecordsTable,
    gymExerciseRecordSets: gymExerciseRecordSetsTable,
    exerciseDefinitionStats: exerciseDefinitionStatsTable,
    exerciseDefinitionRecentGymSessions: exerciseDefinitionRecentGymSessionsTable,
} as const;

export interface BackupRepository {
    exportRows: () => BackupTablesV1;
    hasActiveGymSession: () => boolean;
    replaceRows: (tables: BackupTablesV1) => void;
}

const insertBatches = <Row extends object>(rows: Row[], insert: (batch: Row[]) => void): void => {
    if (rows.length === 0) return;
    const batchSize = Math.max(1, Math.floor(900 / Object.keys(rows[0]).length));
    for (let offset = 0; offset < rows.length; offset += batchSize) {
        insert(rows.slice(offset, offset + batchSize));
    }
};

export const createBackupRepository = ({ db }: { db: RepositoryDb }): BackupRepository => ({
    exportRows: () =>
        db.transaction((tx) => ({
            exerciseDefinitions: tx.select().from(exerciseDefinitionsTable).all(),
            exerciseDefinitionData: tx.select().from(exerciseDefinitionDataTable).all(),
            exerciseDefinitionDefaultTrackingFields: tx
                .select()
                .from(exerciseDefinitionDefaultTrackingFieldsTable)
                .all(),
            workoutVersions: tx.select().from(workoutVersionsTable).all(),
            workouts: tx.select().from(workoutsTable).all(),
            workoutBlocks: tx.select().from(workoutBlocksTable).all(),
            workoutExercises: tx.select().from(workoutExercisesTable).all(),
            workoutSessions: tx.select().from(workoutSessionsTable).all(),
            gymPlans: tx.select().from(gymPlansTable).all(),
            gymPlanSections: tx.select().from(gymPlanSectionsTable).all(),
            gymPlanExercises: tx.select().from(gymPlanExercisesTable).all(),
            gymPlanExerciseTargetSets: tx.select().from(gymPlanExerciseTargetSetsTable).all(),
            gymSessions: tx.select().from(gymSessionsTable).all(),
            gymExerciseRecords: tx.select().from(gymExerciseRecordsTable).all(),
            gymExerciseRecordSets: tx.select().from(gymExerciseRecordSetsTable).all(),
            exerciseDefinitionStats: tx.select().from(exerciseDefinitionStatsTable).all(),
            exerciseDefinitionRecentGymSessions: tx
                .select()
                .from(exerciseDefinitionRecentGymSessionsTable)
                .all(),
        })),
    hasActiveGymSession: () =>
        db
            .select({ id: gymSessionsTable.id })
            .from(gymSessionsTable)
            .where(eq(gymSessionsTable.status, 'active'))
            .limit(1)
            .get() !== undefined,
    replaceRows: (tables) => {
        db.transaction((tx) => {
            tx.delete(exerciseDefinitionRecentGymSessionsTable).run();
            tx.delete(exerciseDefinitionStatsTable).run();
            tx.delete(gymExerciseRecordSetsTable).run();
            tx.delete(gymExerciseRecordsTable).run();
            tx.delete(gymSessionsTable).run();
            tx.delete(gymPlanExerciseTargetSetsTable).run();
            tx.delete(gymPlanExercisesTable).run();
            tx.delete(gymPlanSectionsTable).run();
            tx.delete(gymPlansTable).run();
            tx.delete(workoutSessionsTable).run();
            tx.delete(workoutExercisesTable).run();
            tx.delete(workoutBlocksTable).run();
            tx.delete(workoutsTable).run();
            tx.delete(workoutVersionsTable).run();
            tx.delete(exerciseDefinitionDefaultTrackingFieldsTable).run();
            tx.delete(exerciseDefinitionDataTable).run();
            tx.delete(exerciseDefinitionsTable).run();
            insertBatches(tables.exerciseDefinitions, (batch) => {
                tx.insert(exerciseDefinitionsTable).values(batch).run();
            });
            insertBatches(tables.exerciseDefinitionData, (batch) => {
                tx.insert(exerciseDefinitionDataTable).values(batch).run();
            });
            insertBatches(tables.exerciseDefinitionDefaultTrackingFields, (batch) => {
                tx.insert(exerciseDefinitionDefaultTrackingFieldsTable).values(batch).run();
            });
            insertBatches(tables.workoutVersions, (batch) => {
                tx.insert(workoutVersionsTable).values(batch).run();
            });
            insertBatches(tables.workouts, (batch) => {
                tx.insert(workoutsTable).values(batch).run();
            });
            insertBatches(tables.workoutBlocks, (batch) => {
                tx.insert(workoutBlocksTable).values(batch).run();
            });
            insertBatches(tables.workoutExercises, (batch) => {
                tx.insert(workoutExercisesTable).values(batch).run();
            });
            insertBatches(tables.workoutSessions, (batch) => {
                tx.insert(workoutSessionsTable).values(batch).run();
            });
            // Draft targets may be in a later batch, so link them after all plans exist.
            insertBatches(
                tables.gymPlans.map((plan) => ({ ...plan, draftTargetGymPlanId: null })),
                (batch) => {
                    tx.insert(gymPlansTable).values(batch).run();
                },
            );
            for (const plan of tables.gymPlans) {
                if (plan.draftTargetGymPlanId === null) continue;
                tx.update(gymPlansTable)
                    .set({ draftTargetGymPlanId: plan.draftTargetGymPlanId })
                    .where(eq(gymPlansTable.id, plan.id))
                    .run();
            }
            insertBatches(tables.gymPlanSections, (batch) => {
                tx.insert(gymPlanSectionsTable).values(batch).run();
            });
            insertBatches(tables.gymPlanExercises, (batch) => {
                tx.insert(gymPlanExercisesTable).values(batch).run();
            });
            insertBatches(tables.gymPlanExerciseTargetSets, (batch) => {
                tx.insert(gymPlanExerciseTargetSetsTable).values(batch).run();
            });
            insertBatches(tables.gymSessions, (batch) => {
                tx.insert(gymSessionsTable).values(batch).run();
            });
            insertBatches(tables.gymExerciseRecords, (batch) => {
                tx.insert(gymExerciseRecordsTable).values(batch).run();
            });
            insertBatches(tables.gymExerciseRecordSets, (batch) => {
                tx.insert(gymExerciseRecordSetsTable).values(batch).run();
            });
            insertBatches(tables.exerciseDefinitionStats, (batch) => {
                tx.insert(exerciseDefinitionStatsTable).values(batch).run();
            });
            insertBatches(tables.exerciseDefinitionRecentGymSessions, (batch) => {
                tx.insert(exerciseDefinitionRecentGymSessionsTable).values(batch).run();
            });
            if (tx.all(sql`PRAGMA foreign_key_check`).length > 0) {
                throw new Error('Backup contains invalid references');
            }
        });
    },
});
