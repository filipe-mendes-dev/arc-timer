export const gymSessionKeys = {
    all: ['gymSessions'] as const,
    active: () => ['gymSessions', 'active'] as const,
    detail: (id?: string) => ['gymSessions', 'detail', id ?? ''] as const,
    listItems: () => ['gymSessions', 'listItems'] as const,
};
