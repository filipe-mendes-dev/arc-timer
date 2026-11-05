import type { UUID } from './common.interfaces';

export type TrainingSessionKind = 'hiit' | 'gym';

export interface TrainingSessionListParams {
    kind?: TrainingSessionKind;
    exerciseDefinitionId?: string;
    startedAtMs?: number;
    endedBeforeMs?: number;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface TrainingSessionListItem {
    id: UUID;
    kind: TrainingSessionKind;
    title: string;
    sourceGymPlanName?: string;
    startedAtMs: number;
    endedAtMs?: number;
    durationSec?: number;
    primaryMetric: string;
    secondaryMetric?: string;
    searchText: string;
}
