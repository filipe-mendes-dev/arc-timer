import { describe, expect, it } from '@jest/globals';

import { workoutToExportedWorkout } from '@src/core/exportWorkout/exportWorkout';
import { createWorkoutFixture } from 'tests/fixtures/workouts';

describe('workoutToExportedWorkout', () => {
    it('exports a portable workout without local identifiers', () => {
        const workout = createWorkoutFixture({
            id: 'local-workout-id',
            name: 'Intervals',
            isFavorite: true,
            updatedAtMs: 1_800_000_000_000,
        });

        workout.blocks[0] = {
            ...workout.blocks[0],
            id: 'local-block-id',
        };

        workout.blocks[0].exercises[0] = {
            ...workout.blocks[0].exercises[0],
            id: 'local-exercise-id',
            exerciseDefinitionId: 'local-definition-id',
            name: 'Jumping Jacks',
            value: 30,
            mode: 'time',
            tempo: undefined,
        };

        const exported = workoutToExportedWorkout(workout);
        const exportedJson = JSON.stringify(exported);

        expect(exported.name).toBe('Intervals');

        expect(exported.blocks).toHaveLength(workout.blocks.length);

        expect(exported.blocks[0]).toMatchObject({
            title: workout.blocks[0].title,
            sets: workout.blocks[0].sets,
            restBetweenSetsSec: workout.blocks[0].restBetweenSetsSec,
            restBetweenExercisesSec: workout.blocks[0].restBetweenExercisesSec,
        });

        expect(exported.blocks[0].exercises[0]).toEqual({
            name: 'Jumping Jacks',
            value: 30,
            mode: 'time',
            tempo: undefined,
        });

        expect(exportedJson).not.toContain('local-workout-id');
        expect(exportedJson).not.toContain('local-block-id');
        expect(exportedJson).not.toContain('local-exercise-id');
        expect(exportedJson).not.toContain('local-definition-id');

        expect(exportedJson).not.toContain('updatedAtMs');
        expect(exportedJson).not.toContain('isFavorite');
        expect(exportedJson).not.toContain('blockCount');
        expect(exportedJson).not.toContain('exerciseCount');
    });
});
