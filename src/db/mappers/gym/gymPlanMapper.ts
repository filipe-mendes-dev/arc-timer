import type {
    GymPlan,
    GymPlanListItem,
} from 'src/core/entities/gymPlan.interfaces';

export const gymPlanToGymPlanListItem = (
    gymPlan: GymPlan,
): GymPlanListItem => ({
    id: gymPlan.id,
    name: gymPlan.name,
    description: gymPlan.description,
    createdAtMs: gymPlan.createdAtMs,
    updatedAtMs: gymPlan.updatedAtMs,
    isFavorite: gymPlan.isFavorite,
    status: gymPlan.status,
    sectionCount: gymPlan.sections.length,
    exerciseCount: gymPlan.sections.reduce(
        (total, section) => total + section.exercises.length,
        0,
    ),
});
