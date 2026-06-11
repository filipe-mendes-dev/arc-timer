import { eq } from 'drizzle-orm';

import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';

import type { RepositoryDb } from '../repositories/workouts/workoutRepositoryFactory';
import {
    exerciseDefinitionDataTable,
    exerciseDefinitionDefaultTrackingFieldsTable,
    exerciseDefinitionRecentGymSessionsTable,
    exerciseDefinitionStatsTable,
    exerciseDefinitionsTable,
    gymExerciseRecordsTable,
    gymExerciseRecordSetsTable,
    gymPlanExercisesTable,
    gymPlanExerciseTargetSetsTable,
    gymPlansTable,
    gymPlanSectionsTable,
    gymSessionsTable,
    workoutBlocksTable,
    workoutExercisesTable,
    workoutSessionsTable,
    workoutsTable,
    workoutVersionsTable,
} from '../schema';

const DEMO_CREATED_AT_MS = 1_718_000_000_000;
const DEMO_STATS_UPDATED_AT_MS = Date.UTC(2026, 5, 10, 20, 0, 0);

type ExerciseMode = 'reps' | 'time';
type WorkoutStats = typeof workoutSessionsTable.$inferInsert;

interface DemoExerciseDefinition {
    id: string;
    name: string;
}

interface DemoWorkoutExercise {
    mode: ExerciseMode;
    name: string;
    value: number;
}

interface DemoWorkoutBlock {
    exercises: DemoWorkoutExercise[];
    restBetweenExercisesSec: number;
    restBetweenSetsSec: number;
    sets: number;
    title: string;
}

interface DemoWorkout {
    id: string;
    isFavorite: boolean;
    name: string;
    updatedAtMs: number;
    versionId: string;
    blocks: DemoWorkoutBlock[];
}

interface DemoGymTargetSet {
    durationSec?: number;
    reps?: number;
    weightGrams?: number;
}

interface DemoGymPlanExercise {
    name: string;
    notes?: string;
    targetSets: DemoGymTargetSet[];
}

interface DemoGymPlanSection {
    exercises: DemoGymPlanExercise[];
    title: string;
}

interface DemoGymPlan {
    description: string;
    id: string;
    isFavorite: boolean;
    name: string;
    sections: DemoGymPlanSection[];
    updatedAtMs: number;
}

interface DemoWorkoutSession {
    endedAtMs: number;
    id: string;
    startedAtMs: number;
    stats: {
        completedExercisesByBlock: number[];
        completedSetsByBlock: number[];
        prepSecByBlock: number[];
        restSecByBlock: number[];
        workSecByBlock: number[];
        completedExercises: number;
        completedSets: number;
        totalPrepSec: number;
        totalRestSec: number;
        totalWorkSec: number;
    };
    totalDurationSec: number;
    workoutVersionId: string;
}

interface DemoGymSessionSet {
    durationSec?: number;
    isWarmup?: boolean;
    reps?: number;
    weightGrams?: number;
}

interface DemoGymSessionExercise {
    name: string;
    sets: DemoGymSessionSet[];
    sourceExerciseIndex: number;
    sourceSectionIndex: number;
}

interface DemoGymSession {
    endedAtMs: number;
    exercises: DemoGymSessionExercise[];
    id: string;
    planId: string;
    planName: string;
    startedAtMs: number;
}

interface DemoRows {
    exerciseRecentSessions: Array<
        typeof exerciseDefinitionRecentGymSessionsTable.$inferInsert
    >;
    exerciseStats: Array<typeof exerciseDefinitionStatsTable.$inferInsert>;
    gymExerciseRecords: Array<typeof gymExerciseRecordsTable.$inferInsert>;
    gymExerciseRecordSets: Array<
        typeof gymExerciseRecordSetsTable.$inferInsert
    >;
    gymPlanExercises: Array<typeof gymPlanExercisesTable.$inferInsert>;
    gymPlanExerciseTargetSets: Array<
        typeof gymPlanExerciseTargetSetsTable.$inferInsert
    >;
    gymPlans: Array<typeof gymPlansTable.$inferInsert>;
    gymPlanSections: Array<typeof gymPlanSectionsTable.$inferInsert>;
    gymSessions: Array<typeof gymSessionsTable.$inferInsert>;
    workoutBlocks: Array<typeof workoutBlocksTable.$inferInsert>;
    workoutExercises: Array<typeof workoutExercisesTable.$inferInsert>;
    workoutSessions: WorkoutStats[];
    workouts: Array<typeof workoutsTable.$inferInsert>;
    workoutVersions: Array<typeof workoutVersionsTable.$inferInsert>;
}

const kg = (value: number): number => Math.round(value * 1000);

const utcMs = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second = 0,
): number => Date.UTC(year, month - 1, day, hour, minute, second);

const exerciseDefinitions: DemoExerciseDefinition[] = [
    { id: 'screenshot-exercise-bench-press', name: 'Bench Press' },
    { id: 'screenshot-exercise-squat', name: 'Squat' },
    { id: 'screenshot-exercise-deadlift', name: 'Deadlift' },
    { id: 'screenshot-exercise-pull-up', name: 'Pull Up' },
    { id: 'screenshot-exercise-shoulder-press', name: 'Shoulder Press' },
    { id: 'screenshot-exercise-barbell-row', name: 'Barbell Row' },
    { id: 'screenshot-exercise-plank', name: 'Plank' },
    { id: 'screenshot-exercise-high-knees', name: 'High Knees' },
    { id: 'screenshot-exercise-jump-squat', name: 'Jump Squat' },
    { id: 'screenshot-exercise-push-up', name: 'Push Up' },
    { id: 'screenshot-exercise-burpee', name: 'Burpee' },
    { id: 'screenshot-exercise-battle-rope-slam', name: 'Battle Rope Slam' },
    { id: 'screenshot-exercise-box-jump', name: 'Box Jump' },
    { id: 'screenshot-exercise-mountain-climber', name: 'Mountain Climber' },
    { id: 'screenshot-exercise-reverse-lunge', name: 'Reverse Lunge' },
    { id: 'screenshot-exercise-skater-jump', name: 'Skater Jump' },
    { id: 'screenshot-exercise-squat-jump', name: 'Squat Jump' },
    { id: 'screenshot-exercise-sprint', name: 'Sprint' },
    { id: 'screenshot-exercise-jumping-jack', name: 'Jumping Jack' },
    { id: 'screenshot-exercise-jump-rope', name: 'Jump Rope' },
    { id: 'screenshot-exercise-air-squat', name: 'Air Squat' },
    { id: 'screenshot-exercise-thruster', name: 'Thruster' },
    { id: 'screenshot-exercise-kettlebell-swing', name: 'Kettlebell Swing' },
    { id: 'screenshot-exercise-bicycle-crunch', name: 'Bicycle Crunch' },
    { id: 'screenshot-exercise-russian-twist', name: 'Russian Twist' },
    { id: 'screenshot-exercise-leg-raise', name: 'Leg Raise' },
    { id: 'screenshot-exercise-side-plank', name: 'Side Plank' },
    { id: 'screenshot-exercise-hollow-hold', name: 'Hollow Hold' },
    { id: 'screenshot-exercise-v-up', name: 'V Up' },
    { id: 'screenshot-exercise-wall-sit', name: 'Wall Sit' },
];

const workouts: DemoWorkout[] = [
    {
        id: 'screenshot-workout-power-lactic',
        isFavorite: true,
        name: 'Power Lactic',
        updatedAtMs: utcMs(2026, 5, 29, 8, 0),
        versionId: 'screenshot-workout-version-power-lactic',
        blocks: [
            {
                title: 'Primer',
                sets: 2,
                restBetweenSetsSec: 30,
                restBetweenExercisesSec: 15,
                exercises: [
                    { name: 'High Knees', mode: 'time', value: 30 },
                    { name: 'Jump Squat', mode: 'reps', value: 12 },
                    { name: 'Push Up', mode: 'reps', value: 10 },
                ],
            },
            {
                title: 'Lactic Push',
                sets: 3,
                restBetweenSetsSec: 60,
                restBetweenExercisesSec: 20,
                exercises: [
                    { name: 'Burpee', mode: 'time', value: 30 },
                    { name: 'Mountain Climber', mode: 'time', value: 40 },
                    { name: 'Squat Jump', mode: 'reps', value: 12 },
                ],
            },
            {
                title: 'Finisher',
                sets: 1,
                restBetweenSetsSec: 0,
                restBetweenExercisesSec: 15,
                exercises: [
                    { name: 'Plank', mode: 'time', value: 60 },
                    { name: 'Sprint', mode: 'time', value: 20 },
                ],
            },
        ],
    },
    {
        id: 'screenshot-workout-full-body-hiit',
        isFavorite: false,
        name: 'Full Body HIIT',
        updatedAtMs: utcMs(2026, 5, 28, 18, 0),
        versionId: 'screenshot-workout-version-full-body-hiit',
        blocks: [
            {
                title: 'Warm Up',
                sets: 2,
                restBetweenSetsSec: 20,
                restBetweenExercisesSec: 10,
                exercises: [
                    { name: 'Jumping Jack', mode: 'time', value: 45 },
                    { name: 'Air Squat', mode: 'reps', value: 15 },
                ],
            },
            {
                title: 'Strength Circuit',
                sets: 4,
                restBetweenSetsSec: 75,
                restBetweenExercisesSec: 25,
                exercises: [
                    { name: 'Thruster', mode: 'reps', value: 10 },
                    { name: 'Kettlebell Swing', mode: 'reps', value: 16 },
                    { name: 'Pull Up', mode: 'reps', value: 8 },
                ],
            },
            {
                title: 'Core Reset',
                sets: 2,
                restBetweenSetsSec: 30,
                restBetweenExercisesSec: 15,
                exercises: [
                    { name: 'Bicycle Crunch', mode: 'time', value: 30 },
                    { name: 'Plank', mode: 'time', value: 45 },
                ],
            },
        ],
    },
    {
        id: 'screenshot-workout-core-burner',
        isFavorite: false,
        name: 'Core Burner',
        updatedAtMs: utcMs(2026, 5, 27, 7, 30),
        versionId: 'screenshot-workout-version-core-burner',
        blocks: [
            {
                title: 'Core Circuit',
                sets: 3,
                restBetweenSetsSec: 30,
                restBetweenExercisesSec: 15,
                exercises: [
                    { name: 'Plank', mode: 'time', value: 45 },
                    { name: 'Russian Twist', mode: 'time', value: 30 },
                    { name: 'Bicycle Crunch', mode: 'time', value: 30 },
                    { name: 'Leg Raise', mode: 'reps', value: 12 },
                ],
            },
            {
                title: 'Isometric Finish',
                sets: 2,
                restBetweenSetsSec: 20,
                restBetweenExercisesSec: 10,
                exercises: [
                    { name: 'Side Plank', mode: 'time', value: 30 },
                    { name: 'Hollow Hold', mode: 'time', value: 30 },
                    { name: 'V Up', mode: 'reps', value: 12 },
                ],
            },
        ],
    },
    {
        id: 'screenshot-workout-cardio-blast',
        isFavorite: false,
        name: 'Cardio Blast',
        updatedAtMs: utcMs(2026, 5, 26, 18, 15),
        versionId: 'screenshot-workout-version-cardio-blast',
        blocks: [
            {
                title: 'Engine',
                sets: 4,
                restBetweenSetsSec: 45,
                restBetweenExercisesSec: 15,
                exercises: [
                    { name: 'Jump Rope', mode: 'time', value: 45 },
                    { name: 'High Knees', mode: 'time', value: 35 },
                    { name: 'Skater Jump', mode: 'reps', value: 16 },
                ],
            },
            {
                title: 'Breather',
                sets: 2,
                restBetweenSetsSec: 30,
                restBetweenExercisesSec: 10,
                exercises: [
                    { name: 'Mountain Climber', mode: 'time', value: 30 },
                    { name: 'Plank', mode: 'time', value: 45 },
                ],
            },
        ],
    },
    {
        id: 'screenshot-workout-leg-drive',
        isFavorite: false,
        name: 'Leg Drive',
        updatedAtMs: utcMs(2026, 5, 25, 7, 45),
        versionId: 'screenshot-workout-version-leg-drive',
        blocks: [
            {
                title: 'Strength Pace',
                sets: 3,
                restBetweenSetsSec: 60,
                restBetweenExercisesSec: 20,
                exercises: [
                    { name: 'Air Squat', mode: 'reps', value: 18 },
                    { name: 'Reverse Lunge', mode: 'reps', value: 12 },
                    { name: 'Wall Sit', mode: 'time', value: 45 },
                ],
            },
            {
                title: 'Power Finish',
                sets: 2,
                restBetweenSetsSec: 45,
                restBetweenExercisesSec: 15,
                exercises: [
                    { name: 'Box Jump', mode: 'reps', value: 10 },
                    { name: 'Squat Jump', mode: 'reps', value: 12 },
                ],
            },
        ],
    },
    {
        id: 'screenshot-workout-upper-cut',
        isFavorite: false,
        name: 'Upper Cut',
        updatedAtMs: utcMs(2026, 5, 24, 17, 30),
        versionId: 'screenshot-workout-version-upper-cut',
        blocks: [
            {
                title: 'Push Pull',
                sets: 4,
                restBetweenSetsSec: 50,
                restBetweenExercisesSec: 20,
                exercises: [
                    { name: 'Push Up', mode: 'reps', value: 14 },
                    { name: 'Pull Up', mode: 'reps', value: 6 },
                    { name: 'Battle Rope Slam', mode: 'time', value: 30 },
                ],
            },
            {
                title: 'Core Lock',
                sets: 2,
                restBetweenSetsSec: 25,
                restBetweenExercisesSec: 10,
                exercises: [
                    { name: 'Side Plank', mode: 'time', value: 30 },
                    { name: 'V Up', mode: 'reps', value: 14 },
                ],
            },
        ],
    },
    {
        id: 'screenshot-workout-quick-sweat',
        isFavorite: false,
        name: 'Quick Sweat',
        updatedAtMs: utcMs(2026, 5, 23, 12, 0),
        versionId: 'screenshot-workout-version-quick-sweat',
        blocks: [
            {
                title: 'Ten Minute Burn',
                sets: 3,
                restBetweenSetsSec: 35,
                restBetweenExercisesSec: 10,
                exercises: [
                    { name: 'Burpee', mode: 'time', value: 25 },
                    { name: 'Jumping Jack', mode: 'time', value: 40 },
                    { name: 'Bicycle Crunch', mode: 'time', value: 30 },
                ],
            },
        ],
    },
];

const repeatSets = (
    count: number,
    targetSet: DemoGymTargetSet,
): DemoGymTargetSet[] =>
    Array.from({ length: count }, () => ({ ...targetSet }));

const gymPlans: DemoGymPlan[] = [
    {
        id: 'screenshot-gym-plan-upper-body-strength',
        isFavorite: true,
        name: 'Upper Body Strength',
        description: 'Heavy pressing and pulling for upper-body strength.',
        updatedAtMs: utcMs(2026, 5, 30, 9, 0),
        sections: [
            {
                title: 'Main Lifts',
                exercises: [
                    {
                        name: 'Bench Press',
                        targetSets: repeatSets(4, {
                            reps: 5,
                            weightGrams: kg(80),
                        }),
                    },
                    {
                        name: 'Shoulder Press',
                        targetSets: repeatSets(3, {
                            reps: 6,
                            weightGrams: kg(45),
                        }),
                    },
                ],
            },
            {
                title: 'Pulling',
                exercises: [
                    {
                        name: 'Barbell Row',
                        targetSets: repeatSets(4, {
                            reps: 8,
                            weightGrams: kg(70),
                        }),
                    },
                    {
                        name: 'Pull Up',
                        targetSets: repeatSets(3, { reps: 8 }),
                    },
                ],
            },
        ],
    },
    {
        id: 'screenshot-gym-plan-lower-body-strength',
        isFavorite: false,
        name: 'Lower Body Strength',
        description: 'Squat, hinge, and brace with steady progression.',
        updatedAtMs: utcMs(2026, 5, 29, 9, 0),
        sections: [
            {
                title: 'Main Lifts',
                exercises: [
                    {
                        name: 'Squat',
                        targetSets: repeatSets(5, {
                            reps: 5,
                            weightGrams: kg(110),
                        }),
                    },
                    {
                        name: 'Deadlift',
                        targetSets: repeatSets(3, {
                            reps: 5,
                            weightGrams: kg(140),
                        }),
                    },
                ],
            },
            {
                title: 'Core',
                exercises: [
                    {
                        name: 'Plank',
                        targetSets: repeatSets(3, { durationSec: 60 }),
                    },
                ],
            },
        ],
    },
    {
        id: 'screenshot-gym-plan-push-day',
        isFavorite: false,
        name: 'Push Day',
        description: 'Volume-focused pressing day.',
        updatedAtMs: utcMs(2026, 5, 28, 9, 0),
        sections: [
            {
                title: 'Pressing',
                exercises: [
                    {
                        name: 'Bench Press',
                        targetSets: repeatSets(4, {
                            reps: 8,
                            weightGrams: kg(75),
                        }),
                    },
                    {
                        name: 'Shoulder Press',
                        targetSets: repeatSets(3, {
                            reps: 10,
                            weightGrams: kg(40),
                        }),
                    },
                ],
            },
        ],
    },
    {
        id: 'screenshot-gym-plan-pull-day',
        isFavorite: false,
        name: 'Pull Day',
        description: 'Heavy pulling, rows, and weighted pull-ups.',
        updatedAtMs: utcMs(2026, 5, 27, 9, 0),
        sections: [
            {
                title: 'Heavy Pulls',
                exercises: [
                    {
                        name: 'Deadlift',
                        targetSets: repeatSets(3, {
                            reps: 5,
                            weightGrams: kg(135),
                        }),
                    },
                    {
                        name: 'Barbell Row',
                        targetSets: repeatSets(4, {
                            reps: 8,
                            weightGrams: kg(72.5),
                        }),
                    },
                    {
                        name: 'Pull Up',
                        targetSets: repeatSets(4, {
                            reps: 6,
                            weightGrams: kg(10),
                        }),
                    },
                ],
            },
        ],
    },
    {
        id: 'screenshot-gym-plan-full-body-a',
        isFavorite: false,
        name: 'Full Body A',
        description: 'Balanced full-body session for steady progress.',
        updatedAtMs: utcMs(2026, 5, 26, 9, 0),
        sections: [
            {
                title: 'Strength',
                exercises: [
                    {
                        name: 'Squat',
                        targetSets: repeatSets(3, {
                            reps: 6,
                            weightGrams: kg(100),
                        }),
                    },
                    {
                        name: 'Bench Press',
                        targetSets: repeatSets(3, {
                            reps: 6,
                            weightGrams: kg(72.5),
                        }),
                    },
                    {
                        name: 'Barbell Row',
                        targetSets: repeatSets(3, {
                            reps: 8,
                            weightGrams: kg(67.5),
                        }),
                    },
                ],
            },
        ],
    },
    {
        id: 'screenshot-gym-plan-hypertrophy-upper',
        isFavorite: false,
        name: 'Hypertrophy Upper',
        description: 'Higher-volume upper-body work.',
        updatedAtMs: utcMs(2026, 5, 25, 9, 0),
        sections: [
            {
                title: 'Volume',
                exercises: [
                    {
                        name: 'Bench Press',
                        targetSets: repeatSets(4, {
                            reps: 10,
                            weightGrams: kg(67.5),
                        }),
                    },
                    {
                        name: 'Shoulder Press',
                        targetSets: repeatSets(3, {
                            reps: 10,
                            weightGrams: kg(37.5),
                        }),
                    },
                    {
                        name: 'Pull Up',
                        targetSets: repeatSets(4, { reps: 8 }),
                    },
                ],
            },
        ],
    },
    {
        id: 'screenshot-gym-plan-core-stability',
        isFavorite: false,
        name: 'Core Stability',
        description: 'Bracing and trunk strength for accessory days.',
        updatedAtMs: utcMs(2026, 5, 24, 9, 0),
        sections: [
            {
                title: 'Core',
                exercises: [
                    {
                        name: 'Plank',
                        targetSets: repeatSets(4, { durationSec: 60 }),
                    },
                    {
                        name: 'Deadlift',
                        targetSets: repeatSets(3, {
                            reps: 5,
                            weightGrams: kg(120),
                        }),
                    },
                ],
            },
        ],
    },
];

const workoutSessions: DemoWorkoutSession[] = [
    {
        id: 'screenshot-hiit-session-power-today',
        workoutVersionId: 'screenshot-workout-version-power-lactic',
        startedAtMs: utcMs(2026, 6, 10, 7, 15),
        endedAtMs: utcMs(2026, 6, 10, 7, 40, 40),
        totalDurationSec: 1540,
        stats: {
            completedSets: 6,
            completedExercises: 17,
            completedSetsByBlock: [2, 3, 1],
            completedExercisesByBlock: [6, 9, 2],
            totalWorkSec: 940,
            totalRestSec: 585,
            totalPrepSec: 15,
            workSecByBlock: [250, 540, 150],
            restSecByBlock: [105, 420, 60],
            prepSecByBlock: [5, 5, 5],
        },
    },
    {
        id: 'screenshot-hiit-session-full-body-yesterday',
        workoutVersionId: 'screenshot-workout-version-full-body-hiit',
        startedAtMs: utcMs(2026, 6, 9, 18, 10),
        endedAtMs: utcMs(2026, 6, 9, 18, 41, 20),
        totalDurationSec: 1880,
        stats: {
            completedSets: 8,
            completedExercises: 20,
            completedSetsByBlock: [2, 4, 2],
            completedExercisesByBlock: [4, 12, 4],
            totalWorkSec: 1160,
            totalRestSec: 705,
            totalPrepSec: 15,
            workSecByBlock: [240, 720, 200],
            restSecByBlock: [80, 520, 105],
            prepSecByBlock: [5, 5, 5],
        },
    },
    {
        id: 'screenshot-hiit-session-core-3-days',
        workoutVersionId: 'screenshot-workout-version-core-burner',
        startedAtMs: utcMs(2026, 6, 7, 8, 30),
        endedAtMs: utcMs(2026, 6, 7, 8, 50, 10),
        totalDurationSec: 1210,
        stats: {
            completedSets: 5,
            completedExercises: 18,
            completedSetsByBlock: [3, 2],
            completedExercisesByBlock: [12, 6],
            totalWorkSec: 820,
            totalRestSec: 375,
            totalPrepSec: 15,
            workSecByBlock: [540, 280],
            restSecByBlock: [255, 120],
            prepSecByBlock: [8, 7],
        },
    },
    {
        id: 'screenshot-hiit-session-power-last-week',
        workoutVersionId: 'screenshot-workout-version-power-lactic',
        startedAtMs: utcMs(2026, 6, 3, 7, 25),
        endedAtMs: utcMs(2026, 6, 3, 7, 50, 5),
        totalDurationSec: 1505,
        stats: {
            completedSets: 6,
            completedExercises: 16,
            completedSetsByBlock: [2, 3, 1],
            completedExercisesByBlock: [6, 8, 2],
            totalWorkSec: 900,
            totalRestSec: 590,
            totalPrepSec: 15,
            workSecByBlock: [245, 510, 145],
            restSecByBlock: [110, 415, 65],
            prepSecByBlock: [5, 5, 5],
        },
    },
];

const gymSessions: DemoGymSession[] = [
    {
        id: 'screenshot-gym-session-upper-body-strength',
        planId: 'screenshot-gym-plan-upper-body-strength',
        planName: 'Upper Body Strength',
        startedAtMs: utcMs(2026, 6, 10, 18, 30),
        endedAtMs: utcMs(2026, 6, 10, 19, 38),
        exercises: [
            {
                name: 'Bench Press',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 0,
                sets: [
                    { reps: 8, weightGrams: kg(60), isWarmup: true },
                    { reps: 5, weightGrams: kg(80) },
                    { reps: 5, weightGrams: kg(82.5) },
                    { reps: 4, weightGrams: kg(82.5) },
                ],
            },
            {
                name: 'Shoulder Press',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 1,
                sets: [
                    { reps: 6, weightGrams: kg(40), isWarmup: true },
                    { reps: 6, weightGrams: kg(45) },
                    { reps: 6, weightGrams: kg(45) },
                    { reps: 5, weightGrams: kg(45) },
                ],
            },
            {
                name: 'Barbell Row',
                sourceSectionIndex: 1,
                sourceExerciseIndex: 0,
                sets: [
                    { reps: 8, weightGrams: kg(70) },
                    { reps: 8, weightGrams: kg(72.5) },
                    { reps: 7, weightGrams: kg(72.5) },
                ],
            },
            {
                name: 'Pull Up',
                sourceSectionIndex: 1,
                sourceExerciseIndex: 1,
                sets: [{ reps: 8 }, { reps: 7 }, { reps: 6 }],
            },
        ],
    },
    {
        id: 'screenshot-gym-session-lower-body-strength',
        planId: 'screenshot-gym-plan-lower-body-strength',
        planName: 'Lower Body Strength',
        startedAtMs: utcMs(2026, 6, 8, 7, 0),
        endedAtMs: utcMs(2026, 6, 8, 8, 12),
        exercises: [
            {
                name: 'Squat',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 0,
                sets: [
                    { reps: 8, weightGrams: kg(70), isWarmup: true },
                    { reps: 5, weightGrams: kg(110) },
                    { reps: 5, weightGrams: kg(112.5) },
                    { reps: 4, weightGrams: kg(112.5) },
                ],
            },
            {
                name: 'Deadlift',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 1,
                sets: [
                    { reps: 5, weightGrams: kg(100), isWarmup: true },
                    { reps: 5, weightGrams: kg(140) },
                    { reps: 3, weightGrams: kg(145) },
                ],
            },
            {
                name: 'Plank',
                sourceSectionIndex: 1,
                sourceExerciseIndex: 0,
                sets: [
                    { durationSec: 60 },
                    { durationSec: 75 },
                    { durationSec: 70 },
                ],
            },
        ],
    },
    {
        id: 'screenshot-gym-session-push-day',
        planId: 'screenshot-gym-plan-push-day',
        planName: 'Push Day',
        startedAtMs: utcMs(2026, 6, 6, 10, 0),
        endedAtMs: utcMs(2026, 6, 6, 10, 58),
        exercises: [
            {
                name: 'Bench Press',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 0,
                sets: [
                    { reps: 8, weightGrams: kg(75) },
                    { reps: 8, weightGrams: kg(77.5) },
                    { reps: 7, weightGrams: kg(77.5) },
                    { reps: 8, weightGrams: kg(75) },
                ],
            },
            {
                name: 'Shoulder Press',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 1,
                sets: [
                    { reps: 10, weightGrams: kg(42.5) },
                    { reps: 8, weightGrams: kg(45) },
                    { reps: 6, weightGrams: kg(47.5) },
                ],
            },
        ],
    },
    {
        id: 'screenshot-gym-session-pull-day',
        planId: 'screenshot-gym-plan-pull-day',
        planName: 'Pull Day',
        startedAtMs: utcMs(2026, 6, 4, 18, 20),
        endedAtMs: utcMs(2026, 6, 4, 19, 24),
        exercises: [
            {
                name: 'Deadlift',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 0,
                sets: [
                    { reps: 5, weightGrams: kg(135) },
                    { reps: 4, weightGrams: kg(140) },
                    { reps: 4, weightGrams: kg(140) },
                ],
            },
            {
                name: 'Barbell Row',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 1,
                sets: [
                    { reps: 8, weightGrams: kg(72.5) },
                    { reps: 6, weightGrams: kg(75) },
                    { reps: 8, weightGrams: kg(72.5) },
                ],
            },
            {
                name: 'Pull Up',
                sourceSectionIndex: 0,
                sourceExerciseIndex: 2,
                sets: [
                    { reps: 5, weightGrams: kg(10) },
                    { reps: 5, weightGrams: kg(10) },
                    { reps: 7, weightGrams: kg(5) },
                    { reps: 8 },
                ],
            },
        ],
    },
];

const getDefinitionId = (
    definitionIdByNormalizedName: Map<string, string>,
    name: string,
): string => {
    const id = definitionIdByNormalizedName.get(normalizeExerciseName(name));
    if (!id) {
        throw new Error(`Missing screenshot exercise definition for ${name}`);
    }

    return id;
};

const planSectionId = (planId: string, sectionIndex: number): string =>
    `${planId}-section-${sectionIndex + 1}`;

const planExerciseId = (
    planId: string,
    sectionIndex: number,
    exerciseIndex: number,
): string => `${planSectionId(planId, sectionIndex)}-exercise-${exerciseIndex + 1}`;

const gymRecordId = (sessionId: string, exerciseIndex: number): string =>
    `${sessionId}-record-${exerciseIndex + 1}`;

const gymSetId = (
    sessionId: string,
    exerciseIndex: number,
    setIndex: number,
): string => `${gymRecordId(sessionId, exerciseIndex)}-set-${setIndex + 1}`;

const buildDemoRows = (
    definitionIdByNormalizedName: Map<string, string>,
): DemoRows => {
    const rows: DemoRows = {
        exerciseRecentSessions: [],
        exerciseStats: [],
        gymExerciseRecords: [],
        gymExerciseRecordSets: [],
        gymPlanExercises: [],
        gymPlanExerciseTargetSets: [],
        gymPlans: [],
        gymPlanSections: [],
        gymSessions: [],
        workoutBlocks: [],
        workoutExercises: [],
        workoutSessions: [],
        workouts: [],
        workoutVersions: [],
    };

    workouts.forEach((workout) => {
        rows.workoutVersions.push({
            id: workout.versionId,
            name: workout.name,
            updatedAtMs: workout.updatedAtMs,
        });
        rows.workouts.push({
            id: workout.id,
            name: workout.name,
            currentVersionId: workout.versionId,
            createdAtMs: workout.updatedAtMs,
            isFavorite: workout.isFavorite,
            sortIndex: -workout.updatedAtMs,
        });
        workout.blocks.forEach((block, blockIndex) => {
            const blockId = `${workout.id}-block-${blockIndex + 1}`;
            rows.workoutBlocks.push({
                id: blockId,
                workoutVersionId: workout.versionId,
                sortIndex: blockIndex,
                title: block.title,
                sets: block.sets,
                restBetweenSetsSec: block.restBetweenSetsSec,
                restBetweenExercisesSec: block.restBetweenExercisesSec,
            });
            block.exercises.forEach((exercise, exerciseIndex) => {
                rows.workoutExercises.push({
                    id: `${blockId}-exercise-${exerciseIndex + 1}`,
                    blockId,
                    sortIndex: exerciseIndex,
                    exerciseDefinitionId: getDefinitionId(
                        definitionIdByNormalizedName,
                        exercise.name,
                    ),
                    mode: exercise.mode,
                    value: exercise.value,
                    tempo: null,
                });
            });
        });
    });

    gymPlans.forEach((plan) => {
        rows.gymPlans.push({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            createdAtMs: DEMO_CREATED_AT_MS,
            updatedAtMs: plan.updatedAtMs,
            isFavorite: plan.isFavorite,
            status: 'active',
            draftTargetGymPlanId: null,
        });
        plan.sections.forEach((section, sectionIndex) => {
            const sectionId = planSectionId(plan.id, sectionIndex);
            rows.gymPlanSections.push({
                id: sectionId,
                gymPlanId: plan.id,
                title: section.title,
                sortIndex: sectionIndex,
                createdAtMs: DEMO_CREATED_AT_MS,
                updatedAtMs: plan.updatedAtMs,
            });
            section.exercises.forEach((exercise, exerciseIndex) => {
                const exerciseId = planExerciseId(
                    plan.id,
                    sectionIndex,
                    exerciseIndex,
                );
                rows.gymPlanExercises.push({
                    id: exerciseId,
                    gymPlanSectionId: sectionId,
                    exerciseDefinitionId: getDefinitionId(
                        definitionIdByNormalizedName,
                        exercise.name,
                    ),
                    sortIndex: exerciseIndex,
                    notes: exercise.notes ?? null,
                    createdAtMs: DEMO_CREATED_AT_MS,
                    updatedAtMs: plan.updatedAtMs,
                });
                exercise.targetSets.forEach((targetSet, setIndex) => {
                    rows.gymPlanExerciseTargetSets.push({
                        id: `${exerciseId}-target-set-${setIndex + 1}`,
                        gymPlanExerciseId: exerciseId,
                        setIndex,
                        reps: targetSet.reps ?? null,
                        weightGrams: targetSet.weightGrams ?? null,
                        durationSec: targetSet.durationSec ?? null,
                        distanceMeters: null,
                        rpeTenths: null,
                        createdAtMs: DEMO_CREATED_AT_MS,
                        updatedAtMs: plan.updatedAtMs,
                    });
                });
            });
        });
    });

    workoutSessions.forEach((session) => {
        rows.workoutSessions.push({
            id: session.id,
            startedAtMs: session.startedAtMs,
            endedAtMs: session.endedAtMs,
            workoutVersionId: session.workoutVersionId,
            totalDurationSec: session.totalDurationSec,
            statsJson: JSON.stringify(session.stats),
        });
    });

    gymSessions.forEach((session) => {
        rows.gymSessions.push({
            id: session.id,
            startedAtMs: session.startedAtMs,
            endedAtMs: session.endedAtMs,
            status: 'completed',
            sourceGymPlanId: session.planId,
            sourceGymPlanName: session.planName,
            notes: null,
            createdAtMs: session.startedAtMs,
            updatedAtMs: session.endedAtMs,
        });
        session.exercises.forEach((exercise, exerciseIndex) => {
            const recordId = gymRecordId(session.id, exerciseIndex);
            rows.gymExerciseRecords.push({
                id: recordId,
                gymSessionId: session.id,
                exerciseDefinitionId: getDefinitionId(
                    definitionIdByNormalizedName,
                    exercise.name,
                ),
                sourceGymPlanSectionId: planSectionId(
                    session.planId,
                    exercise.sourceSectionIndex,
                ),
                sourceGymPlanSectionTitle:
                    gymPlans
                        .find((plan) => plan.id === session.planId)
                        ?.sections.at(exercise.sourceSectionIndex)?.title ??
                    null,
                sourceGymPlanExerciseId: planExerciseId(
                    session.planId,
                    exercise.sourceSectionIndex,
                    exercise.sourceExerciseIndex,
                ),
                sortIndex: exerciseIndex,
                startedAtMs: session.startedAtMs + exerciseIndex * 600_000,
                notes: null,
                createdAtMs: session.startedAtMs,
                updatedAtMs: session.endedAtMs,
            });
            exercise.sets.forEach((set, setIndex) => {
                rows.gymExerciseRecordSets.push({
                    id: gymSetId(session.id, exerciseIndex, setIndex),
                    gymExerciseRecordId: recordId,
                    setIndex,
                    reps: set.reps ?? null,
                    weightGrams: set.weightGrams ?? null,
                    durationSec: set.durationSec ?? null,
                    distanceMeters: null,
                    rpeTenths: null,
                    isWarmup: set.isWarmup === true,
                    completedAtMs:
                        session.startedAtMs +
                        exerciseIndex * 600_000 +
                        setIndex * 120_000,
                    notes: null,
                    createdAtMs: session.startedAtMs,
                    updatedAtMs: session.endedAtMs,
                });
            });
        });
    });

    const addStats = (
        exerciseName: string,
        recentSessionIds: string[],
        weightPr?: {
            completedAtMs: number;
            reps: number;
            sessionId: string;
            setId: string;
            weightGrams: number;
        },
    ): void => {
        const exerciseDefinitionId = getDefinitionId(
            definitionIdByNormalizedName,
            exerciseName,
        );
        const recentSessions = recentSessionIds.map((sessionId, sortIndex) => {
            const session = gymSessions.find((item) => item.id === sessionId);
            if (!session) {
                throw new Error(`Missing screenshot gym session ${sessionId}`);
            }

            return {
                exerciseDefinitionId,
                gymSessionId: sessionId,
                sortIndex,
                startedAtMs: session.startedAtMs,
                createdAtMs: DEMO_STATS_UPDATED_AT_MS,
                updatedAtMs: DEMO_STATS_UPDATED_AT_MS,
            };
        });
        rows.exerciseRecentSessions.push(...recentSessions);
        rows.exerciseStats.push({
            exerciseDefinitionId,
            weightPrSetId: weightPr?.setId ?? null,
            weightPrGymSessionId: weightPr?.sessionId ?? null,
            weightPrGrams: weightPr?.weightGrams ?? null,
            weightPrReps: weightPr?.reps ?? null,
            weightPrCompletedAtMs: weightPr?.completedAtMs ?? null,
            distancePrSetId: null,
            distancePrGymSessionId: null,
            distancePrMeters: null,
            distancePrReps: null,
            distancePrCompletedAtMs: null,
            lastCompletedGymSessionId: recentSessionIds[0] ?? null,
            createdAtMs: DEMO_STATS_UPDATED_AT_MS,
            updatedAtMs: DEMO_STATS_UPDATED_AT_MS,
        });
    };

    addStats(
        'Bench Press',
        [
            'screenshot-gym-session-upper-body-strength',
            'screenshot-gym-session-push-day',
        ],
        {
            sessionId: 'screenshot-gym-session-upper-body-strength',
            setId: gymSetId('screenshot-gym-session-upper-body-strength', 0, 2),
            weightGrams: kg(82.5),
            reps: 5,
            completedAtMs: utcMs(2026, 6, 10, 18, 34),
        },
    );
    addStats('Squat', ['screenshot-gym-session-lower-body-strength'], {
        sessionId: 'screenshot-gym-session-lower-body-strength',
        setId: gymSetId('screenshot-gym-session-lower-body-strength', 0, 2),
        weightGrams: kg(112.5),
        reps: 5,
        completedAtMs: utcMs(2026, 6, 8, 7, 4),
    });
    addStats(
        'Deadlift',
        [
            'screenshot-gym-session-lower-body-strength',
            'screenshot-gym-session-pull-day',
        ],
        {
            sessionId: 'screenshot-gym-session-lower-body-strength',
            setId: gymSetId('screenshot-gym-session-lower-body-strength', 1, 2),
            weightGrams: kg(145),
            reps: 3,
            completedAtMs: utcMs(2026, 6, 8, 7, 14),
        },
    );
    addStats(
        'Shoulder Press',
        [
            'screenshot-gym-session-upper-body-strength',
            'screenshot-gym-session-push-day',
        ],
        {
            sessionId: 'screenshot-gym-session-push-day',
            setId: gymSetId('screenshot-gym-session-push-day', 1, 2),
            weightGrams: kg(47.5),
            reps: 6,
            completedAtMs: utcMs(2026, 6, 6, 10, 14),
        },
    );
    addStats(
        'Barbell Row',
        [
            'screenshot-gym-session-upper-body-strength',
            'screenshot-gym-session-pull-day',
        ],
        {
            sessionId: 'screenshot-gym-session-pull-day',
            setId: gymSetId('screenshot-gym-session-pull-day', 1, 1),
            weightGrams: kg(75),
            reps: 6,
            completedAtMs: utcMs(2026, 6, 4, 18, 32),
        },
    );
    addStats(
        'Pull Up',
        [
            'screenshot-gym-session-upper-body-strength',
            'screenshot-gym-session-pull-day',
        ],
        {
            sessionId: 'screenshot-gym-session-pull-day',
            setId: gymSetId('screenshot-gym-session-pull-day', 2, 0),
            weightGrams: kg(10),
            reps: 5,
            completedAtMs: utcMs(2026, 6, 4, 18, 40),
        },
    );
    addStats('Plank', ['screenshot-gym-session-lower-body-strength']);

    return rows;
};

export const seedScreenshotDemoData = async (
    repositoryDb: RepositoryDb,
): Promise<void> => {
    repositoryDb.transaction((tx) => {
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
        tx.delete(exerciseDefinitionsTable)
            .where(eq(exerciseDefinitionsTable.source, 'user'))
            .run();

        const existingDefinitions = tx
            .select({
                id: exerciseDefinitionsTable.id,
                normalizedName: exerciseDefinitionsTable.normalizedName,
            })
            .from(exerciseDefinitionsTable)
            .all();
        const existingIdsByNormalizedName = new Map(
            existingDefinitions.map((definition) => [
                definition.normalizedName,
                definition.id,
            ]),
        );
        const missingDefinitions = exerciseDefinitions.filter((definition) => {
            const normalizedName = normalizeExerciseName(definition.name);

            return !existingIdsByNormalizedName.has(normalizedName);
        });

        if (missingDefinitions.length > 0) {
            const missingDefinitionRows: Array<
                typeof exerciseDefinitionsTable.$inferInsert
            > = missingDefinitions.map((definition) => ({
                id: definition.id,
                name: definition.name,
                normalizedName: normalizeExerciseName(definition.name),
                source: 'user',
                availability: 'both',
                createdAtMs: DEMO_CREATED_AT_MS,
                updatedAtMs: DEMO_CREATED_AT_MS,
            }));

            tx.insert(exerciseDefinitionsTable)
                .values(missingDefinitionRows)
                .run();
        }

        const definitionRows = tx
            .select({
                id: exerciseDefinitionsTable.id,
                normalizedName: exerciseDefinitionsTable.normalizedName,
            })
            .from(exerciseDefinitionsTable)
            .all();
        const definitionIdByNormalizedName = new Map(
            definitionRows.map((definition) => [
                definition.normalizedName,
                definition.id,
            ]),
        );
        const rows = buildDemoRows(definitionIdByNormalizedName);

        tx.insert(workoutVersionsTable).values(rows.workoutVersions).run();
        tx.insert(workoutsTable).values(rows.workouts).run();
        tx.insert(workoutBlocksTable).values(rows.workoutBlocks).run();
        tx.insert(workoutExercisesTable).values(rows.workoutExercises).run();
        tx.insert(workoutSessionsTable).values(rows.workoutSessions).run();
        tx.insert(gymPlansTable).values(rows.gymPlans).run();
        tx.insert(gymPlanSectionsTable).values(rows.gymPlanSections).run();
        tx.insert(gymPlanExercisesTable).values(rows.gymPlanExercises).run();
        tx.insert(gymPlanExerciseTargetSetsTable)
            .values(rows.gymPlanExerciseTargetSets)
            .run();
        tx.insert(gymSessionsTable).values(rows.gymSessions).run();
        tx.insert(gymExerciseRecordsTable)
            .values(rows.gymExerciseRecords)
            .run();
        tx.insert(gymExerciseRecordSetsTable)
            .values(rows.gymExerciseRecordSets)
            .run();
        tx.insert(exerciseDefinitionStatsTable)
            .values(rows.exerciseStats)
            .run();
        tx.insert(exerciseDefinitionRecentGymSessionsTable)
            .values(rows.exerciseRecentSessions)
            .run();
    });
};
