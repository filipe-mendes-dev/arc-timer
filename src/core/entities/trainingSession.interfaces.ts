import type { UUID } from './common.interfaces';

export type TrainingSessionKind = 'hiit' | 'gym';

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
