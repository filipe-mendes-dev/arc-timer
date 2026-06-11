import type {
    GymSession,
    GymSessionListItem,
} from '@src/core/entities/gymSession.interfaces';

export const gymSessionToGymSessionListItem = (
    gymSession: GymSession,
): GymSessionListItem => ({
    id: gymSession.id,
    startedAtMs: gymSession.startedAtMs,
    endedAtMs: gymSession.endedAtMs,
    status: gymSession.status,
    sourceGymPlanId: gymSession.sourceGymPlanId,
    sourceGymPlanName: gymSession.sourceGymPlanName,
    exerciseRecordCount: gymSession.exerciseRecordCount,
    setCount: gymSession.setCount,
});
