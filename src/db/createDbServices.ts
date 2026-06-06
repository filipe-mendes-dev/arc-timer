import { createExerciseDefinitionRepository } from './repositories/exerciseDefinitions/exerciseDefinitionRepositoryFactory';
import {
    createGymExerciseRecordRepository,
    type GymExerciseRecordRepository,
} from './repositories/gyms/gymExerciseRecordRepositoryFactory';
import {
    createGymPlanRepository,
    type GymPlanRepository,
} from './repositories/gyms/gymPlanRepositoryFactory';
import {
    createGymSessionRepository,
    type GymSessionRepository,
} from './repositories/gyms/gymSessionRepositoryFactory';
import { systemClock, type Clock } from './repositories/repositoryClock';
import {
    createWorkoutRepository,
    type RepositoryDb,
} from './repositories/workouts/workoutRepositoryFactory';
import { createWorkoutSessionRepository } from './repositories/workoutSessions/workoutSessionRepositoryFactory';
import { createExerciseDefinitionService } from './services/exerciseDefinitions/exerciseDefinitionServiceFactory';
import {
    createWorkoutService,
    type WorkoutService,
} from './services/workouts/workoutServiceFactory';
import {
    createWorkoutSessionService,
    type WorkoutSessionService,
} from './services/workoutSessions/workoutSessionServiceFactory';
import {
    createGymSessionService,
    type GymSessionService,
} from './services/gyms/gymSessionServiceFactory';
import {
    createGymPlanService,
    type GymPlanService,
} from './services/gyms/gymPlanServiceFactory';
import type { ExerciseDefinitionService } from './services/exerciseDefinitions/exerciseDefinitionServiceFactory';
import type { WorkoutRepository } from './repositories/workouts/workoutRepositoryFactory';
import type { WorkoutSessionRepository } from './repositories/workoutSessions/workoutSessionRepositoryFactory';

export interface CreateDbServicesArgs {
    clock?: Clock;
    db: RepositoryDb;
}

export interface DbServices {
    exerciseDefinitionService: ExerciseDefinitionService;
    gymExerciseRecordRepository: GymExerciseRecordRepository;
    gymPlanRepository: GymPlanRepository;
    gymPlanService: GymPlanService;
    gymSessionRepository: GymSessionRepository;
    gymSessionService: GymSessionService;
    workoutRepository: WorkoutRepository;
    workoutService: WorkoutService;
    workoutSessionRepository: WorkoutSessionRepository;
    workoutSessionService: WorkoutSessionService;
}

export const createDbServices = ({
    clock = systemClock,
    db,
}: CreateDbServicesArgs): DbServices => {
    const exerciseDefinitionRepository = createExerciseDefinitionRepository({
        db,
    });
    const exerciseDefinitionService = createExerciseDefinitionService({
        clock,
        exerciseDefinitionRepository,
    });
    const workoutRepository = createWorkoutRepository({
        db,
    });
    const workoutSessionRepository = createWorkoutSessionRepository({
        db,
    });
    const gymSessionRepository = createGymSessionRepository({
        db,
    });
    const gymExerciseRecordRepository = createGymExerciseRecordRepository({
        db,
    });
    const gymPlanRepository = createGymPlanRepository({
        db,
    });
    const workoutService = createWorkoutService({
        clock,
        exerciseDefinitionService,
        workoutRepository,
        workoutSessionRepository,
    });
    const workoutSessionService = createWorkoutSessionService({
        exerciseDefinitionService,
        workoutRepository,
        workoutSessionRepository,
    });
    const gymSessionService = createGymSessionService({
        clock,
        exerciseDefinitionService,
        gymExerciseRecordRepository,
        gymPlanRepository,
        gymSessionRepository,
    });
    const gymPlanService = createGymPlanService({
        clock,
        exerciseDefinitionService,
        gymPlanRepository,
    });

    return {
        exerciseDefinitionService,
        gymExerciseRecordRepository,
        gymPlanRepository,
        gymPlanService,
        gymSessionRepository,
        gymSessionService,
        workoutRepository,
        workoutService,
        workoutSessionRepository,
        workoutSessionService,
    };
};
