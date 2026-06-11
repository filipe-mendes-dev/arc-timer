import { useMutation, useQueryClient } from '@tanstack/react-query';

import { dbServices } from '@src/db/dbServices';
import type { Workout } from '@src/core/entities/workout.interfaces';
import type { WorkoutSessionStats } from '@src/core/entities/workoutSession.interfaces';

import { workoutSessionKeys } from './workoutSessionKeys';
import { trainingSessionKeys } from '../trainingSessions/trainingSessionKeys';

export interface AddWorkoutSessionArgs {
    versionId?: string;
    workout?: Workout;
    startedAtMs: number;
    endedAtMs: number;
    stats?: WorkoutSessionStats;
}

export const useAddWorkoutSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            versionId,
            workout,
            startedAtMs,
            endedAtMs,
            stats,
        }: AddWorkoutSessionArgs) => {
            if (versionId) {
                return dbServices.workoutSessionService.createSession({
                    versionId,
                    startedAtMs,
                    endedAtMs,
                    stats,
                });
            }
            if (!workout) {
                throw new Error('workout is required when versionId is absent');
            }
            return dbServices.workoutSessionService.createSessionFromSnapshot({
                workout,
                startedAtMs,
                endedAtMs,
                stats,
            });
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workoutSessionKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: trainingSessionKeys.all,
                }),
            ]);
        },
    });
};

export const useRemoveWorkoutSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            dbServices.workoutSessionService.deleteSession(id);
            return id;
        },
        onSuccess: async (id) => {
            queryClient.removeQueries({
                queryKey: workoutSessionKeys.detail(id),
            });
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workoutSessionKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: trainingSessionKeys.all,
                }),
            ]);
        },
    });
};

export const useClearWorkoutSessions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            dbServices.workoutSessionService.clearSessions();
        },
        onSuccess: async () => {
            queryClient.removeQueries({
                queryKey: workoutSessionKeys.all,
            });
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workoutSessionKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: trainingSessionKeys.all,
                }),
            ]);
        },
    });
};
