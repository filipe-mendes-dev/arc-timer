import type { GymPlan } from '../entities/gym.interfaces';

export const ARC_GYM_PLAN_KIND = 'arc-timer/gym-plan' as const;
export const ARC_GYM_PLAN_EXTENSION = '.arcgp' as const;
export const ARC_GYM_PLAN_MIME =
    'application/vnd.arctimer.gym-plan+json' as const;

export type ArcGymPlanKind = typeof ARC_GYM_PLAN_KIND;

export interface ExportedGymPlanFileV1 {
    version: 1;
    kind: ArcGymPlanKind;
    exportedAt: string;
    app: {
        name: string;
        platform: 'mobile';
    };
    gymPlan: GymPlan;
}
