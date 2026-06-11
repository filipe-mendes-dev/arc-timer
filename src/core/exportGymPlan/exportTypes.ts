export const ARC_GYM_PLAN_KIND = 'arc-timer/gym-plan' as const;
export const ARC_GYM_PLAN_EXTENSION = '.arcgp' as const;
export const ARC_GYM_PLAN_MIME =
    'application/vnd.arctimer.gym-plan+json' as const;

export type ArcGymPlanKind = typeof ARC_GYM_PLAN_KIND;

export interface ExportedGymPlanTargetSetV1 {
    setIndex: number;
    reps?: number;
    weightGrams?: number;
    durationSec?: number;
    distanceMeters?: number;
    rpeTenths?: number;
}

export interface ExportedGymPlanExerciseV1 {
    name: string;
    sortIndex: number;
    notes?: string;
    targetSets: ExportedGymPlanTargetSetV1[];
}

export interface ExportedGymPlanSectionV1 {
    title?: string;
    sortIndex: number;
    exercises: ExportedGymPlanExerciseV1[];
}

export interface ExportedGymPlanV1 {
    name?: string;
    description?: string;
    sections: ExportedGymPlanSectionV1[];
}

export interface ExportedGymPlanFileV1 {
    version: 1;
    kind: ArcGymPlanKind;
    exportedAt: string;
    app: {
        name: string;
        platform: 'mobile';
    };
    gymPlan: ExportedGymPlanV1;
}
