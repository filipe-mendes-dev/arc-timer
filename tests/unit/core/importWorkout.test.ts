import { describe, expect, it } from '@jest/globals';

import { parseImportedWorkoutFileContent } from '@src/core/importWorkout/importWorkout';
import {
    ARC_WORKOUT_KIND,
    type ExportedWorkoutFileV1,
    type ExportedWorkoutFileV2,
} from '@src/core/exportWorkout/exportTypes';

const createDeterministicIdFactory = () => {
    let nextId = 0;

    return () => {
        nextId += 1;
        return `generated-id-${nextId}`;
    };
};

describe('parseImportedWorkoutFileContent', () => {
    it('imports a V2 workout file into a local workout', () => {
        const payload: ExportedWorkoutFileV2 = {
            version: 2,
            kind: ARC_WORKOUT_KIND,
            exportedAt: '2026-06-08T14:56:28.648Z',
            app: {
                name: 'ARC Timer',
                platform: 'mobile',
            },
            workout: {
                name: 'Imported Intervals',
                blocks: [
                    {
                        title: 'Main',
                        sets: 2,
                        restBetweenSetsSec: 45,
                        restBetweenExercisesSec: 15,
                        exercises: [
                            {
                                name: 'High Knees',
                                mode: 'time',
                                value: 40,
                            },
                        ],
                    },
                ],
            },
        };

        const result = parseImportedWorkoutFileContent(
            JSON.stringify(payload),
            {
                createId: createDeterministicIdFactory(),
                nowMs: 1_800_000_000_000,
            },
        );

        expect(result.ok).toBe(true);

        if (!result.ok) return;

        expect(result.workout).toMatchObject({
            name: 'Imported Intervals',
            updatedAtMs: 1_800_000_000_000,
            isFavorite: false,
            blockCount: 1,
            exerciseCount: 1,
            blocks: [
                {
                    title: 'Main',
                    sets: 2,
                    restBetweenSetsSec: 45,
                    restBetweenExercisesSec: 15,
                    exercises: [
                        {
                            name: 'High Knees',
                            mode: 'time',
                            value: 40,
                            tempo: undefined,
                        },
                    ],
                },
            ],
        });

        expect(result.workout.id).toBeTruthy();
        expect(result.workout.blocks[0].id).toBeTruthy();
        expect(result.workout.blocks[0].exercises[0].id).toBeTruthy();

        expect(
            new Set([
                result.workout.id,
                result.workout.blocks[0].id,
                result.workout.blocks[0].exercises[0].id,
            ]).size,
        ).toBe(3);
    });

    it('imports a legacy V1 workout file through the V2 migration path', () => {
        const payload: ExportedWorkoutFileV1 = {
            version: 1,
            kind: ARC_WORKOUT_KIND,
            exportedAt: '2026-06-08T14:56:28.648Z',
            app: {
                name: 'ARC Timer',
                platform: 'mobile',
            },
            workout: {
                id: 'legacy-workout-id',
                name: 'Abs Workout',
                blocks: [
                    {
                        id: 'legacy-block-id',
                        title: 'Block 1',
                        sets: 3,
                        restBetweenSetsSec: 60,
                        restBetweenExercisesSec: 20,
                        exercises: [
                            {
                                id: 'legacy-exercise-id',
                                mode: 'time',
                                value: 40,
                                name: 'Plank',
                            },
                        ],
                    },
                ],
                updatedAtMs: 1_778_598_944_148,
                isFavorite: true,
            },
        };

        const result = parseImportedWorkoutFileContent(
            JSON.stringify(payload),
            {
                createId: createDeterministicIdFactory(),
                nowMs: 1_800_000_000_000,
            },
        );

        expect(result.ok).toBe(true);

        if (!result.ok) return;

        const importedJson = JSON.stringify(result.workout);

        expect(result.workout).toMatchObject({
            name: 'Abs Workout',
            updatedAtMs: 1_800_000_000_000,
            isFavorite: false,
            blockCount: 1,
            exerciseCount: 1,
            blocks: [
                {
                    title: 'Block 1',
                    sets: 3,
                    restBetweenSetsSec: 60,
                    restBetweenExercisesSec: 20,
                    exercises: [
                        {
                            name: 'Plank',
                            mode: 'time',
                            value: 40,
                            tempo: undefined,
                        },
                    ],
                },
            ],
        });

        expect(importedJson).not.toContain('legacy-workout-id');
        expect(importedJson).not.toContain('legacy-block-id');
        expect(importedJson).not.toContain('legacy-exercise-id');
        expect(importedJson).not.toContain('1_778_598_944_148');
        expect(result.workout.isFavorite).toBe(false);
    });

    it('returns PARSE_FAILED when the file content is not valid JSON', () => {
        const result = parseImportedWorkoutFileContent('{invalid-json');

        expect(result).toEqual({
            ok: false,
            error: 'PARSE_FAILED',
        });
    });

    it('returns INVALID_KIND when the file kind is not a workout', () => {
        const payload = {
            version: 2,
            kind: 'arc-timer/gym-plan',
            exportedAt: '2026-06-08T14:56:28.648Z',
            app: {
                name: 'ARC Timer',
                platform: 'mobile',
            },
            workout: {
                name: 'Imported Intervals',
                blocks: [],
            },
        };

        const result = parseImportedWorkoutFileContent(JSON.stringify(payload));

        expect(result).toEqual({
            ok: false,
            error: 'INVALID_KIND',
        });
    });

    it('returns INVALID_SHAPE when the workout version shape is invalid', () => {
        const payload = {
            version: 2,
            kind: ARC_WORKOUT_KIND,
            exportedAt: '2026-06-08T14:56:28.648Z',
            app: {
                name: 'ARC Timer',
                platform: 'mobile',
            },
            workout: {
                name: 'Broken Workout',
            },
        };

        const result = parseImportedWorkoutFileContent(JSON.stringify(payload));

        expect(result).toEqual({
            ok: false,
            error: 'INVALID_SHAPE',
        });
    });
});
