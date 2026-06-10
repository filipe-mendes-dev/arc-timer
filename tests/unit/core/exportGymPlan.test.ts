import { describe, expect, it } from '@jest/globals';

import { gymPlanToExportedGymPlan } from '@src/core/exportGymPlan/exportGymPlan';
import {
    createGymPlanExerciseFixture,
    createGymPlanExerciseTargetSetFixture,
    createGymPlanFixture,
    createGymPlanSectionFixture,
} from 'tests/fixtures/gymPlans.fixtures';

describe('gymPlanToExportedGymPlan', () => {
    it('exports portable exercise names without local gym plan identifiers', () => {
        const gymPlan = createGymPlanFixture({
            id: 'local-plan-id',
            name: 'Strength',
            description: 'Upper body',
            sections: [
                createGymPlanSectionFixture({
                    id: 'local-section-id',
                    title: 'Push',
                    exercises: [
                        createGymPlanExerciseFixture({
                            id: 'local-exercise-id',
                            exerciseDefinitionId: 'local-definition-id',
                            notes: 'Pause at the bottom',
                            targetSetDrafts: [
                                createGymPlanExerciseTargetSetFixture({
                                    id: 'local-target-set-id',
                                    reps: 8,
                                    weightGrams: 60_000,
                                    rpeTenths: 85,
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });

        const exported = gymPlanToExportedGymPlan(
            gymPlan,
            new Map([['local-definition-id', 'Bench Press']]),
        );
        const exportedJson = JSON.stringify(exported);

        expect(exported).toEqual({
            name: 'Strength',
            description: 'Upper body',
            sections: [
                {
                    title: 'Push',
                    sortIndex: 0,
                    exercises: [
                        {
                            name: 'Bench Press',
                            sortIndex: 0,
                            notes: 'Pause at the bottom',
                            targetSets: [
                                {
                                    setIndex: 0,
                                    reps: 8,
                                    weightGrams: 60_000,
                                    durationSec: undefined,
                                    distanceMeters: undefined,
                                    rpeTenths: 85,
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        expect(exportedJson).not.toContain('local-plan-id');
        expect(exportedJson).not.toContain('local-section-id');
        expect(exportedJson).not.toContain('local-exercise-id');
        expect(exportedJson).not.toContain('local-target-set-id');
        expect(exportedJson).not.toContain('local-definition-id');
    });
});
