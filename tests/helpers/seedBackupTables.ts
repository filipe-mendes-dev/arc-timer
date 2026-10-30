import type { BackupTablesV1 } from '@src/core/backup/backupTypes';
import { backupTables } from '@src/db/repositories/backups/backupRepositoryFactory';
import type { TestDb } from './createTestDb';

export const seedBackupTables = (testDb: TestDb, tables: BackupTablesV1): void => {
    for (const row of tables.exerciseDefinitions) {
        testDb.db.insert(backupTables.exerciseDefinitions).values(row).run();
    }
    for (const row of tables.exerciseDefinitionData) {
        testDb.db.insert(backupTables.exerciseDefinitionData).values(row).run();
    }
    for (const row of tables.exerciseDefinitionDefaultTrackingFields) {
        testDb.db.insert(backupTables.exerciseDefinitionDefaultTrackingFields).values(row).run();
    }
    for (const row of tables.workoutVersions) {
        testDb.db.insert(backupTables.workoutVersions).values(row).run();
    }
    for (const row of tables.workouts) {
        testDb.db.insert(backupTables.workouts).values(row).run();
    }
    for (const row of tables.workoutBlocks) {
        testDb.db.insert(backupTables.workoutBlocks).values(row).run();
    }
    for (const row of tables.workoutExercises) {
        testDb.db.insert(backupTables.workoutExercises).values(row).run();
    }
    for (const row of tables.workoutSessions) {
        testDb.db.insert(backupTables.workoutSessions).values(row).run();
    }
    if (tables.gymPlans.length > 0) {
        testDb.db.insert(backupTables.gymPlans).values(tables.gymPlans).run();
    }
    for (const row of tables.gymPlanSections) {
        testDb.db.insert(backupTables.gymPlanSections).values(row).run();
    }
    for (const row of tables.gymPlanExercises) {
        testDb.db.insert(backupTables.gymPlanExercises).values(row).run();
    }
    for (const row of tables.gymPlanExerciseTargetSets) {
        testDb.db.insert(backupTables.gymPlanExerciseTargetSets).values(row).run();
    }
    for (const row of tables.gymSessions) {
        testDb.db.insert(backupTables.gymSessions).values(row).run();
    }
    for (const row of tables.gymExerciseRecords) {
        testDb.db.insert(backupTables.gymExerciseRecords).values(row).run();
    }
    for (const row of tables.gymExerciseRecordSets) {
        testDb.db.insert(backupTables.gymExerciseRecordSets).values(row).run();
    }
    for (const row of tables.exerciseDefinitionStats) {
        testDb.db.insert(backupTables.exerciseDefinitionStats).values(row).run();
    }
    for (const row of tables.exerciseDefinitionRecentGymSessions) {
        testDb.db.insert(backupTables.exerciseDefinitionRecentGymSessions).values(row).run();
    }
};
