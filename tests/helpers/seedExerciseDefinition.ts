import { eq } from 'drizzle-orm';

import type { ExerciseDefinition } from '@src/core/entities/exerciseDefinition.interfaces';
import { exerciseDefinitionsTable } from '@src/db/schema';

import type { TestDb } from './createTestDb';

export const seedExerciseDefinition = (
    testDb: TestDb,
    definition: ExerciseDefinition,
): ExerciseDefinition => {
    const definitionInsert = {
        id: definition.id,
        name: definition.name,
        normalizedName: definition.normalizedName,
        source: definition.source,
        availability: definition.availability,
        createdAtMs: definition.createdAtMs,
        updatedAtMs: definition.updatedAtMs,
    };
    const existingDefinition = testDb.db
        .select()
        .from(exerciseDefinitionsTable)
        .where(
            eq(
                exerciseDefinitionsTable.normalizedName,
                definition.normalizedName,
            ),
        )
        .get();

    if (existingDefinition) return existingDefinition;

    testDb.db.insert(exerciseDefinitionsTable).values(definitionInsert).run();

    return definition;
};
