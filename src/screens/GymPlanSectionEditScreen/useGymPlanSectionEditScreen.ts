import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type {
    GymPlanExercise,
    GymPlanSection,
} from '@src/core/entities/gymPlan.interfaces';
import {
    createEmptyGymPlanSection,
    stripPlaceholderGymPlanExercises,
} from '@src/core/gyms/gymPlanDrafts';
import { useUpsertDraftGymPlan } from '@src/data/gymPlans';
import { useGymExerciseDefinitions } from '@src/data/gymSessions';
import { useGymPlanBuilderStore } from '@src/state/stores/useGymPlanBuilderStore';

interface UseGymPlanSectionEditScreenResult {
    addExercise: () => void;
    cancelRemoveExercise: () => void;
    confirmRemoveExercise: () => void;
    definitionNameById: ReadonlyMap<string, string>;
    exerciseIdToRemove: string | null;
    goBack: () => void;
    isCreatingSection: boolean;
    isSaving: boolean;
    openExercise: (exerciseId: string) => void;
    requestRemoveExercise: (exerciseId: string) => void;
    saveSection: () => void;
    sectionDraft: GymPlanSection | null;
    sectionLabel: string;
    sectionTitleInput: string;
    commitSectionTitleInput: () => void;
    updateSectionTitleInput: (title: string) => void;
    updateSection: (patch: Partial<GymPlanSection>) => void;
}

const getSectionLabel = (
    section: GymPlanSection | null,
    t: ReturnType<typeof useTranslation>['t'],
): string => {
    if (!section) return t('gymPlanBuilder.sectionEditor.title');

    const trimmedTitle = section.title?.trim();
    if (trimmedTitle && trimmedTitle.length > 0) return trimmedTitle;

    return t('gymPlanBuilder.sectionFallback', {
        index: section.sortIndex + 1,
    });
};

const getPersistedSectionTitle = (title: string): string | undefined => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 0) return trimmedTitle;

    return undefined;
};

export const useGymPlanSectionEditScreen =
    (): UseGymPlanSectionEditScreenResult => {
        const { t } = useTranslation();
        const router = useRouter();
        const { sectionId } = useLocalSearchParams<{ sectionId?: string }>();
        const isCreatingSection = !sectionId;
        const upsertDraft = useUpsertDraftGymPlan();
        const builderDraft = useGymPlanBuilderStore((state) => state.draft);
        const checkpointDraft = useGymPlanBuilderStore(
            (state) => state.checkpointDraft,
        );
        const setBuilderDraft = useGymPlanBuilderStore(
            (state) => state.setDraft,
        );
        const [sectionDraft, setSectionDraft] =
            useState<GymPlanSection | null>(null);
        const [sectionTitleInput, setSectionTitleInput] = useState('');
        const [exerciseIdToRemove, setExerciseIdToRemove] =
            useState<string | null>(null);
        const { data: allExerciseDefinitions = [] } =
            useGymExerciseDefinitions();

        useEffect(() => {
            if (!builderDraft) {
                setSectionDraft(null);
                setSectionTitleInput('');
                return;
            }

            if (isCreatingSection) {
                setSectionDraft(
                    (current) => current ?? createEmptyGymPlanSection(),
                );
                return;
            }

            const section =
                builderDraft.sections.find((item) => item.id === sectionId) ??
                null;

            setSectionDraft(section);
            setSectionTitleInput(section?.title ?? '');
        }, [builderDraft, isCreatingSection, sectionId]);

        const definitionNameById = useMemo(
            () =>
                new Map(
                    allExerciseDefinitions.map((definition) => [
                        definition.id,
                        definition.name,
                    ]),
                ),
            [allExerciseDefinitions],
        );

        const updateSection = (patch: Partial<GymPlanSection>): void => {
            setSectionDraft((current) => {
                if (!current) return current;

                return {
                    ...current,
                    ...patch,
                };
            });
        };

        const updateExercises = (exercises: GymPlanExercise[]): void => {
            updateSection({
                exercises: exercises.map((exercise, exerciseIndex) => ({
                    ...exercise,
                    sortIndex: exerciseIndex,
                })),
            });
        };

        const commitSectionTitleInput = (): void => {
            const trimmedTitle = sectionTitleInput.trim();
            updateSection({
                title: trimmedTitle.length > 0 ? trimmedTitle : undefined,
            });
        };

        const addExercise = (): void => {
            if (!sectionDraft) return;

            setBuilderDraft((currentDraft) => {
                if (!currentDraft) return currentDraft;

                const hasExistingSection = currentDraft.sections.some(
                    (section) => section.id === sectionDraft.id,
                );
                if (!hasExistingSection) {
                    return {
                        ...currentDraft,
                        sections: [
                            ...currentDraft.sections,
                            {
                            ...sectionDraft,
                            title: getPersistedSectionTitle(sectionTitleInput),
                            sortIndex: currentDraft.sections.length,
                        },
                        ],
                    };
                }

                return {
                    ...currentDraft,
                    sections: currentDraft.sections.map((section) => {
                        if (section.id !== sectionDraft.id) return section;

                        return {
                            ...sectionDraft,
                            title: getPersistedSectionTitle(sectionTitleInput),
                        };
                    }),
                };
            });
            router.push({
                pathname: '/gymPlans/edit-exercise',
                params: {
                    sectionId: sectionDraft.id,
                },
            });
        };

        const removeExercise = (exerciseId: string): void => {
            if (!sectionDraft) return;

            updateExercises(
                sectionDraft.exercises.filter(
                    (exercise) => exercise.id !== exerciseId,
                ),
            );
            setExerciseIdToRemove(null);
        };

        const openExercise = (exerciseId: string): void => {
            if (!sectionDraft) return;

            setBuilderDraft((currentDraft) => {
                if (!currentDraft) return currentDraft;

                return {
                    ...currentDraft,
                    sections: currentDraft.sections.map((section) => {
                        if (section.id !== sectionDraft.id) return section;

                        return {
                            ...sectionDraft,
                            title: sectionTitleInput.trim(),
                        };
                    }),
                };
            });
            router.push({
                pathname: '/gymPlans/edit-exercise',
                params: {
                    exerciseId,
                    sectionId: sectionDraft.id,
                },
            });
        };

        const saveSection = (): void => {
            if (!builderDraft || !sectionDraft) return;

            const nextSectionDraft = {
                ...sectionDraft,
                title: getPersistedSectionTitle(sectionTitleInput),
            };
            const nextDraft = {
                ...builderDraft,
                sections: builderDraft.sections.map((section, sectionIndex) => {
                    if (section.id !== nextSectionDraft.id) {
                        return {
                            ...section,
                            sortIndex: sectionIndex,
                        };
                    }

                    return {
                        ...nextSectionDraft,
                        sortIndex: sectionIndex,
                    };
                }),
            };
            const hasExistingSection = builderDraft.sections.some(
                (section) => section.id === nextSectionDraft.id,
            );

            if (!hasExistingSection) {
                nextDraft.sections = [
                    ...nextDraft.sections,
                    {
                        ...nextSectionDraft,
                        sortIndex: nextDraft.sections.length,
                    },
                ];
            }

            setBuilderDraft(nextDraft);
            upsertDraft.mutate(stripPlaceholderGymPlanExercises(nextDraft), {
                onSuccess: () => {
                    checkpointDraft();
                    router.back();
                },
            });
        };

        return {
            addExercise,
            cancelRemoveExercise: () => setExerciseIdToRemove(null),
            confirmRemoveExercise: () => {
                if (exerciseIdToRemove) {
                    removeExercise(exerciseIdToRemove);
                }
            },
            definitionNameById,
            exerciseIdToRemove,
            goBack: () => router.back(),
            isCreatingSection,
            isSaving: upsertDraft.isPending,
            openExercise,
            requestRemoveExercise: setExerciseIdToRemove,
            saveSection,
            sectionDraft,
            sectionLabel: getSectionLabel(sectionDraft, t),
            sectionTitleInput,
            commitSectionTitleInput,
            updateSectionTitleInput: setSectionTitleInput,
            updateSection,
        };
    };
