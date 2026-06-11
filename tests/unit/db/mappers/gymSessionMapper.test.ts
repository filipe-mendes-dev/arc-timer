import { describe, expect, it } from '@jest/globals';

import { gymSessionToGymSessionListItem } from '@src/db/mappers/gym/gymSessionMapper';
import { createGymSessionFixture } from 'tests/fixtures/gymSession.fixtures';

describe('gymSessionToGymSessionListItem', () => {
    it('maps a gym session aggregate to a gym session list item', () => {
        const gymSession = createGymSessionFixture({
            id: 'gym-session-1',
            startedAtMs: 1_800_000_000_000,
            endedAtMs: 1_800_000_003_000,
            status: 'completed',
            sourceGymPlanId: 'gym-plan-1',
            sourceGymPlanName: 'Push Day',
            notes: 'Good session',
        });

        const listItem = gymSessionToGymSessionListItem(gymSession);

        expect(listItem).toEqual({
            id: gymSession.id,
            startedAtMs: gymSession.startedAtMs,
            endedAtMs: gymSession.endedAtMs,
            status: gymSession.status,
            sourceGymPlanId: gymSession.sourceGymPlanId,
            sourceGymPlanName: gymSession.sourceGymPlanName,
            exerciseRecordCount: gymSession.exerciseRecordCount,
            setCount: gymSession.setCount,
        });
    });
});
