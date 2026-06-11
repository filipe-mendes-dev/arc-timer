import type { ExerciseDefinition } from '@src/core/entities/exerciseDefinition.interfaces';
import { normalizeExerciseName } from '@src/core/exercises/normalizeExerciseName';

export interface ExerciseDefinitionFixtureArgs {
    availability?: ExerciseDefinition['availability'];
    canDelete?: ExerciseDefinition['canDelete'];
    createdAtMs?: number;
    data?: ExerciseDefinition['data'];
    deleteBlockReason?: ExerciseDefinition['deleteBlockReason'];
    id?: string;
    name?: string;
    recentSessions?: ExerciseDefinition['recentSessions'];
    references?: ExerciseDefinition['references'];
    source?: ExerciseDefinition['source'];
    stats?: ExerciseDefinition['stats'];
    updatedAtMs?: number;
}

export const createExerciseDefinitionFixture = (
    args: ExerciseDefinitionFixtureArgs = {},
): ExerciseDefinition => {
    const name = args.name ?? 'Jumping Jacks';
    const createdAtMs = args.createdAtMs ?? 1_800_000_000_000;
    const source = args.source ?? 'user';

    const definition: ExerciseDefinition = {
        id: args.id ?? `definition-${normalizeExerciseName(name)}`,
        name,
        normalizedName: normalizeExerciseName(name),
        source,
        availability: args.availability ?? 'both',
        canDelete: args.canDelete ?? source !== 'system',
        data: args.data,
        deleteBlockReason: args.deleteBlockReason,
        recentSessions: args.recentSessions,
        references: args.references,
        stats: args.stats,
        createdAtMs,
        updatedAtMs: args.updatedAtMs ?? createdAtMs,
    };

    if (source === 'system') {
        return {
            ...definition,
            deleteBlockReason: 'system',
        };
    }

    return definition;
};
