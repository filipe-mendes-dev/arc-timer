import type {
    GymExerciseRecord,
    GymExerciseRecordSet,
    GymSession,
} from '@src/core/entities/gymSession.interfaces';
import {
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymSessionsTable,
} from '@src/db/schema';

import type { TestDb } from './createTestDb';

export const seedGymSession = (
    testDb: TestDb,
    gymSession: GymSession,
): GymSession => {
    testDb.db
        .insert(gymSessionsTable)
        .values({
            createdAtMs: gymSession.createdAtMs,
            endedAtMs: gymSession.endedAtMs ?? null,
            id: gymSession.id,
            notes: gymSession.notes ?? null,
            sourceGymPlanId: gymSession.sourceGymPlanId ?? null,
            startedAtMs: gymSession.startedAtMs,
            status: gymSession.status,
            updatedAtMs: gymSession.updatedAtMs,
        })
        .run();

    gymSession.exerciseRecords.forEach((exerciseRecord) => {
        seedGymExerciseRecord(testDb, gymSession.id, exerciseRecord);
    });

    return gymSession;
};

export const seedGymExerciseRecord = (
    testDb: TestDb,
    gymSessionId: string,
    exerciseRecord: GymExerciseRecord,
): GymExerciseRecord => {
    testDb.db
        .insert(gymExerciseRecordsTable)
        .values({
            createdAtMs: exerciseRecord.createdAtMs,
            exerciseDefinitionId: exerciseRecord.exerciseDefinitionId,
            gymSessionId,
            id: exerciseRecord.id,
            notes: exerciseRecord.notes ?? null,
            sortIndex: exerciseRecord.sortIndex,
            sourceGymPlanSectionId:
                exerciseRecord.sourceGymPlanSectionId ?? null,
            sourceGymPlanSectionTitle:
                exerciseRecord.sourceGymPlanSectionTitle ?? null,
            sourceGymPlanExerciseId:
                exerciseRecord.sourceGymPlanExerciseId ?? null,
            startedAtMs: exerciseRecord.startedAtMs ?? null,
            updatedAtMs: exerciseRecord.updatedAtMs,
        })
        .run();

    exerciseRecord.sets.forEach((set) => {
        seedGymExerciseRecordSet(testDb, exerciseRecord.id, set);
    });

    return exerciseRecord;
};

export const seedGymExerciseRecordSet = (
    testDb: TestDb,
    gymExerciseRecordId: string,
    set: GymExerciseRecordSet,
): GymExerciseRecordSet => {
    testDb.db
        .insert(gymExerciseRecordSetsTable)
        .values({
            completedAtMs: set.completedAtMs ?? null,
            createdAtMs: set.createdAtMs,
            distanceMeters: set.distanceMeters ?? null,
            durationSec: set.durationSec ?? null,
            gymExerciseRecordId,
            id: set.id,
            isWarmup: set.isWarmup,
            notes: set.notes ?? null,
            reps: set.reps ?? null,
            rpeTenths: set.rpeTenths ?? null,
            setIndex: set.setIndex,
            updatedAtMs: set.updatedAtMs,
            weightGrams: set.weightGrams ?? null,
        })
        .run();

    return set;
};
