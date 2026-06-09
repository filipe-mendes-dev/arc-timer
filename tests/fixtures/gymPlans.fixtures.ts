import type {
    GymPlan,
    GymPlanExercise,
    GymPlanExerciseTargetSet,
    GymPlanSection,
    GymPlanStatus,
} from '@src/core/entities/gymPlan.interfaces';

export interface GymPlanExerciseTargetSetFixtureArgs {
    createdAtMs?: number;
    distanceMeters?: number;
    durationSec?: number;
    id?: string;
    reps?: number;
    rpeTenths?: number;
    setIndex?: number;
    updatedAtMs?: number;
    weightGrams?: number;
}

export interface GymPlanExerciseFixtureArgs {
    createdAtMs?: number;
    exerciseDefinitionId?: string;
    id?: string;
    notes?: string;
    sortIndex?: number;
    targetSetDrafts?: GymPlanExerciseTargetSet[];
    updatedAtMs?: number;
}

export interface GymPlanSectionFixtureArgs {
    createdAtMs?: number;
    exercises?: GymPlanExercise[];
    id?: string;
    sortIndex?: number;
    title?: string;
    updatedAtMs?: number;
}

export interface GymPlanFixtureArgs {
    createdAtMs?: number;
    description?: string;
    draftTargetGymPlanId?: string;
    id?: string;
    isFavorite?: boolean;
    name?: string;
    sections?: GymPlanSection[];
    status?: GymPlanStatus;
    updatedAtMs?: number;
}

const DEFAULT_CREATED_AT_MS = 1_800_000_000_000;

export const createGymPlanExerciseTargetSetFixture = (
    args: GymPlanExerciseTargetSetFixtureArgs = {},
): GymPlanExerciseTargetSet => {
    const createdAtMs = args.createdAtMs ?? DEFAULT_CREATED_AT_MS;

    return {
        id: args.id ?? 'gym-plan-exercise-target-set-1',
        setIndex: args.setIndex ?? 0,
        reps: args.reps,
        weightGrams: args.weightGrams,
        durationSec: args.durationSec,
        distanceMeters: args.distanceMeters,
        rpeTenths: args.rpeTenths,
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
    };
};

export const createGymPlanExerciseFixture = (
    args: GymPlanExerciseFixtureArgs = {},
): GymPlanExercise => {
    const createdAtMs = args.createdAtMs ?? DEFAULT_CREATED_AT_MS;

    return {
        id: args.id ?? 'gym-plan-exercise-1',
        exerciseDefinitionId:
            args.exerciseDefinitionId ?? 'definition-gym-plan-exercise',
        sortIndex: args.sortIndex ?? 0,
        targetSetDrafts: args.targetSetDrafts ?? [],
        notes: args.notes,
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
    };
};

export const createGymPlanSectionFixture = (
    args: GymPlanSectionFixtureArgs = {},
): GymPlanSection => {
    const createdAtMs = args.createdAtMs ?? DEFAULT_CREATED_AT_MS;

    return {
        id: args.id ?? 'gym-plan-section-1',
        title: args.title,
        sortIndex: args.sortIndex ?? 0,
        exercises: args.exercises ?? [
            createGymPlanExerciseFixture({
                exerciseDefinitionId: 'definition-gym-plan-exercise',
            }),
        ],
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
    };
};

export const createGymPlanFixture = (
    args: GymPlanFixtureArgs = {},
): GymPlan => {
    const createdAtMs = args.createdAtMs ?? DEFAULT_CREATED_AT_MS;
    const sections = args.sections ?? [
        createGymPlanSectionFixture({
            exercises: [
                createGymPlanExerciseFixture({
                    exerciseDefinitionId: 'definition-gym-plan-exercise',
                }),
            ],
        }),
    ];

    return {
        id: args.id ?? 'gym-plan-1',
        name: args.name ?? 'Push Day',
        description: args.description,
        sections,
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
        isFavorite: args.isFavorite ?? false,
        status: args.status ?? 'active',
        sectionCount: sections.length,
        exerciseCount: sections.reduce(
            (total, section) => total + section.exercises.length,
            0,
        ),
        draftTargetGymPlanId: args.draftTargetGymPlanId,
    };
};
