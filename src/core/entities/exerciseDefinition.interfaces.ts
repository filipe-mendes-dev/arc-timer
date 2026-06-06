import type { UUID } from './common.interfaces';

export type ExerciseDefinitionSource = 'system' | 'user';

export type ExerciseDefinitionAvailability = 'both' | 'workout' | 'gym';

export interface ExerciseDefinition {
    id: UUID;
    name: string;
    normalizedName: string;
    source: ExerciseDefinitionSource;
    availability: ExerciseDefinitionAvailability;
    createdAtMs: number;
    updatedAtMs: number;
}
