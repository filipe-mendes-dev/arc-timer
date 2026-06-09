import type {
    GymExerciseRecord,
    GymExerciseRecordSet,
    GymSession,
    GymSessionStatus,
} from '@src/core/entities/gymSession.interfaces';

export interface GymExerciseRecordSetFixtureArgs {
    completedAtMs?: number;
    createdAtMs?: number;
    distanceMeters?: number;
    durationSec?: number;
    id?: string;
    isWarmup?: boolean;
    notes?: string;
    reps?: number;
    rpeTenths?: number;
    setIndex?: number;
    updatedAtMs?: number;
    weightGrams?: number;
}

export interface GymExerciseRecordFixtureArgs {
    createdAtMs?: number;
    exerciseDefinitionId?: string;
    id?: string;
    notes?: string;
    sets?: GymExerciseRecordSet[];
    sortIndex?: number;
    sourceGymPlanExerciseId?: string;
    startedAtMs?: number;
    updatedAtMs?: number;
}

export interface GymSessionFixtureArgs {
    createdAtMs?: number;
    endedAtMs?: number;
    exerciseRecords?: GymExerciseRecord[];
    id?: string;
    notes?: string;
    sourceGymPlanId?: string;
    sourceGymPlanName?: string;
    startedAtMs?: number;
    status?: GymSessionStatus;
    updatedAtMs?: number;
}

const DEFAULT_CREATED_AT_MS = 1_800_000_000_000;

export const createGymExerciseRecordSetFixture = (
    args: GymExerciseRecordSetFixtureArgs = {},
): GymExerciseRecordSet => {
    const createdAtMs = args.createdAtMs ?? DEFAULT_CREATED_AT_MS;

    return {
        id: args.id ?? 'gym-exercise-record-set-1',
        setIndex: args.setIndex ?? 0,
        reps: args.reps,
        weightGrams: args.weightGrams,
        durationSec: args.durationSec,
        distanceMeters: args.distanceMeters,
        rpeTenths: args.rpeTenths,
        isWarmup: args.isWarmup ?? false,
        completedAtMs: args.completedAtMs,
        notes: args.notes,
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
    };
};

export const createGymExerciseRecordFixture = (
    args: GymExerciseRecordFixtureArgs = {},
): GymExerciseRecord => {
    const createdAtMs = args.createdAtMs ?? DEFAULT_CREATED_AT_MS;
    const sets = args.sets ?? [];

    return {
        id: args.id ?? 'gym-exercise-record-1',
        exerciseDefinitionId:
            args.exerciseDefinitionId ?? 'definition-gym-exercise-record',
        sourceGymPlanExerciseId: args.sourceGymPlanExerciseId,
        sortIndex: args.sortIndex ?? 0,
        startedAtMs: args.startedAtMs,
        notes: args.notes,
        sets,
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
    };
};

export const createGymSessionFixture = (
    args: GymSessionFixtureArgs = {},
): GymSession => {
    const createdAtMs = args.createdAtMs ?? DEFAULT_CREATED_AT_MS;
    const exerciseRecords = args.exerciseRecords ?? [];

    return {
        id: args.id ?? 'gym-session-1',
        startedAtMs: args.startedAtMs ?? createdAtMs,
        endedAtMs: args.endedAtMs,
        status: args.status ?? 'active',
        sourceGymPlanId: args.sourceGymPlanId,
        sourceGymPlanName: args.sourceGymPlanName,
        notes: args.notes,
        exerciseRecords,
        exerciseRecordCount: exerciseRecords.length,
        setCount: exerciseRecords.reduce(
            (total, record) => total + record.sets.length,
            0,
        ),
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
    };
};
