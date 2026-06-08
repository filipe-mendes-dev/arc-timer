import type { TrainingSessionKind } from '@src/core/entities/trainingSession.interfaces';

export const trainingSessionKeys = {
    all: ['trainingSessions'] as const,
    listItems: (kind?: TrainingSessionKind, limit?: number) =>
        ['trainingSessions', 'listItems', kind ?? 'all', limit ?? 'all'] as const,
};
