import { describe, expect, it } from '@jest/globals';

import { createImportedGymPlanDraft } from '@src/screens/GymPlansScreen/GymPlansScreen.import';

describe('createImportedGymPlanDraft', () => {
    const createId = (() => {
        let nextId = 0;

        return () => {
            nextId += 1;
            return `generated-id-${nextId}`;
        };
    })();

    it('resolves exported exercise names into local exercise definitions', () => {
        const draft = createImportedGymPlanDraft({
            gymPlan: {
                name: 'Imported Strength',
                description: 'Portable plan',
                sections: [
                    {
                        title: 'Push',
                        sortIndex: 7,
                        exercises: [
                            {
                                name: ' Bench Press ',
                                sortIndex: 5,
                                notes: 'Controlled reps',
                                targetSets: [
                                    {
                                        setIndex: 4,
                                        reps: 8,
                                        weightGrams: 60_000,
                                        rpeTenths: 85,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            resolveExerciseDefinitionIdByName: (name) =>
                name === 'Bench Press' ? 'local-bench-press-id' : null,
            createId,
            nowMs: 1_800_000_000_000,
        });

        expect(draft).toMatchObject({
            id: 'generated-id-4',
            name: 'Imported Strength',
            description: 'Portable plan',
            isFavorite: false,
            status: 'active',
            sectionCount: 1,
            exerciseCount: 1,
            sections: [
                {
                    id: 'generated-id-3',
                    title: 'Push',
                    sortIndex: 0,
                    exercises: [
                        {
                            id: 'generated-id-1',
                            exerciseDefinitionId: 'local-bench-press-id',
                            name: 'Bench Press',
                            sortIndex: 0,
                            notes: 'Controlled reps',
                            targetSetDrafts: [
                                {
                                    id: 'generated-id-2',
                                    setIndex: 0,
                                    reps: 8,
                                    weightGrams: 60_000,
                                    rpeTenths: 85,
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    it('rejects exported exercises without resolvable names', () => {
        const missingNameDraft = createImportedGymPlanDraft({
            gymPlan: {
                name: 'Imported Strength',
                sections: [
                    {
                        sortIndex: 0,
                        exercises: [
                            {
                                name: '   ',
                                sortIndex: 0,
                                targetSets: [],
                            },
                        ],
                    },
                ],
            },
            resolveExerciseDefinitionIdByName: () => 'local-definition-id',
        });
        const unresolvedNameDraft = createImportedGymPlanDraft({
            gymPlan: {
                name: 'Imported Strength',
                sections: [
                    {
                        sortIndex: 0,
                        exercises: [
                            {
                                name: 'Unknown Lift',
                                sortIndex: 0,
                                targetSets: [],
                            },
                        ],
                    },
                ],
            },
            resolveExerciseDefinitionIdByName: () => null,
        });

        expect(missingNameDraft).toBeNull();
        expect(unresolvedNameDraft).toBeNull();
    });
});
