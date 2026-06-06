export const gymPlanKeys = {
    all: ['gymPlans'] as const,
    detail: (id?: string) => ['gymPlans', 'detail', id ?? ''] as const,
    draft: () => ['gymPlans', 'draft'] as const,
    listItems: (includeArchived?: boolean) =>
        ['gymPlans', 'listItems', includeArchived === true] as const,
};
