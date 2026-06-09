import { describe, expect, it } from '@jest/globals';
import { gymPlanToGymPlanListItem } from '@src/db/mappers/gym/gymPlanMapper';
import { createGymPlanFixture } from 'tests/fixtures/gymPlans';

describe('gymPlanToGymPlanListItem', () => {
    it('maps a gym plan aggregate to a gym plan list item', () => {
        const gymPlan = createGymPlanFixture({
            id: 'gym-plan-1',
            name: 'Push Day',
            description: 'Upper body strength',
            isFavorite: true,
            status: 'active',
        });

        const listItem = gymPlanToGymPlanListItem(gymPlan);

        expect(listItem).toEqual({
            id: gymPlan.id,
            name: gymPlan.name,
            description: gymPlan.description,
            createdAtMs: gymPlan.createdAtMs,
            updatedAtMs: gymPlan.updatedAtMs,
            isFavorite: gymPlan.isFavorite,
            status: gymPlan.status,
            sectionCount: gymPlan.sectionCount,
            exerciseCount: gymPlan.exerciseCount,
        });
    });
});
