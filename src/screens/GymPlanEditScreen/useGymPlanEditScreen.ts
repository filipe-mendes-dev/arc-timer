import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import type { MainContainerHandle } from '@src/components/layout/MainContainer/MainContainer';
import type {
    GymPlan,
    GymPlanExercise,
    GymPlanSection,
} from '@src/core/entities/gym.interfaces';
import { uid } from '@src/core/id';
import {
    useCommitGymPlanDraft,
    useDiscardGymPlanDraft,
    useDiscardStaleDraftGymPlan,
    useDraftGymPlan,
    useUpsertDraftGymPlan,
} from '@src/data/gymPlans';
import { useGymExerciseDefinitions } from '@src/data/gymSessions';
import { useSystemBackHandler } from '@src/hooks/navigation/useSystemBackHandler';

const DRAFT_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const DEFAULT_SECTION_EXERCISE_COUNT = 2;

interface ValidationError {
    field: 'name' | 'sections';
    message: string;
}

interface UseGymPlanEditScreenResult {
    addSection: () => void;
    cancelLeave: () => void;
    confirmDiscardAndLeave: () => void;
    confirmRemoveSection: () => void;
    definitionNameById: ReadonlyMap<string, string>;
    draft: GymPlan | null;
    errorMessage: string;
    isLeaveConfirmVisible: boolean;
    isSaving: boolean;
    isNotesVisible: boolean;
    leaveBuilder: () => void;
    mainContainerRef: React.RefObject<MainContainerHandle | null>;
    nameErrorMessage?: string;
    openSection: (sectionId: string) => void;
    removeSectionId: string | null;
    saveDraft: () => void;
    setLeaveConfirmVisible: (isVisible: boolean) => void;
    setRemoveSectionId: (sectionId: string | null) => void;
    topBarOptions: readonly TopBarOption[];
    updateDescription: (description: string) => void;
    updateName: (name: string) => void;
    validationDismissalKey: number;
}

const isPlaceholderExercise = (exercise: GymPlanExercise): boolean =>
    exercise.exerciseDefinitionId.trim().length === 0;

const createEmptySection = (): GymPlanSection => {
    const nowMs = Date.now();

    return {
        id: uid(),
        title: '',
        sortIndex: 0,
        exercises: [],
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
    };
};

const createPlaceholderExercise = (index: number): GymPlanExercise => {
    const nowMs = Date.now();

    return {
        id: uid(),
        exerciseDefinitionId: '',
        name: `Exercise ${index}`,
        sortIndex: index - 1,
        targetSets: 3,
        targetReps: 10,
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
    };
};

const createSectionWithPlaceholders = (
    exerciseCount: number,
): GymPlanSection => ({
    ...createEmptySection(),
    exercises: Array.from({ length: exerciseCount }).map((_item, index) =>
        createPlaceholderExercise(index + 1),
    ),
});

const stripPlaceholderExercises = (gymPlan: GymPlan): GymPlan => ({
    ...gymPlan,
    sections: gymPlan.sections.map((section) => ({
        ...section,
        exercises: section.exercises.filter(
            (exercise) => !isPlaceholderExercise(exercise),
        ),
    })),
});

export const useGymPlanEditScreen = (): UseGymPlanEditScreenResult => {
    const { t } = useTranslation();
    const router = useRouter();
    const draftQuery = useDraftGymPlan();
    const discardStaleDraft = useDiscardStaleDraftGymPlan();
    const upsertDraft = useUpsertDraftGymPlan();
    const commitDraft = useCommitGymPlanDraft();
    const discardDraft = useDiscardGymPlanDraft();
    const { data: allExerciseDefinitions = [] } = useGymExerciseDefinitions();
    const [draft, setDraft] = useState<GymPlan | null>(null);
    const [isNotesVisible, setNotesVisible] = useState(false);
    const [removeSectionId, setRemoveSectionId] = useState<string | null>(null);
    const [isLeaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [validationDismissalKey, setValidationDismissalKey] = useState(0);
    const mainContainerRef = useRef<MainContainerHandle | null>(null);
    const hydratedDraftIdRef = useRef<string | null>(null);

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

    useEffect(() => {
        discardStaleDraft.mutate(DRAFT_MAX_AGE_MS);
        // Run once on entry so stale persisted drafts are cleaned before use.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const queryDraft = draftQuery.data;
        if (!queryDraft) {
            if (!hydratedDraftIdRef.current) {
                setDraft(null);
            }
            return;
        }

        if (hydratedDraftIdRef.current === queryDraft.id) return;

        hydratedDraftIdRef.current = queryDraft.id;
        setDraft(queryDraft);
        setNotesVisible((queryDraft.description?.trim().length ?? 0) > 0);
    }, [draftQuery.data]);

    const persistDraft = useCallback(
        (nextDraft: GymPlan): void => {
            setDraft(nextDraft);
            upsertDraft.mutate(stripPlaceholderExercises(nextDraft));
        },
        [upsertDraft],
    );

    useEffect(() => {
        if (!draft) return;
        if (draft.draftTargetGymPlanId) return;

        const shouldCreateSection = draft.sections.length === 0;
        if (shouldCreateSection) {
            persistDraft({
                ...draft,
                sections: [
                    createSectionWithPlaceholders(
                        DEFAULT_SECTION_EXERCISE_COUNT,
                    ),
                ],
            });
            return;
        }

        const hasEmptySection = draft.sections.some(
            (section) => section.exercises.length === 0,
        );
        if (!hasEmptySection) return;

        persistDraft({
            ...draft,
            sections: draft.sections.map((section) => {
                if (section.exercises.length > 0) return section;

                return {
                    ...section,
                    exercises: [createPlaceholderExercise(1)],
                };
            }),
        });
    }, [draft, persistDraft]);

    const requestLeave = useCallback((): boolean => {
        if (!draft) return false;

        setLeaveConfirmVisible(true);
        return true;
    }, [draft]);

    const { allowNextBack } = useSystemBackHandler({
        onSystemBack: requestLeave,
    });

    const leaveBuilder = useCallback(() => {
        allowNextBack();
        router.back();
    }, [allowNextBack, router]);

    const confirmDiscardAndLeave = useCallback(() => {
        discardDraft.mutate(undefined, {
            onSuccess: leaveBuilder,
        });
    }, [discardDraft, leaveBuilder]);

    const updateDraft = useCallback(
        (patch: Partial<GymPlan>) => {
            if (!draft) return;

            persistDraft({
                ...draft,
                ...patch,
            });
            if (patch.name !== undefined) {
                setErrors((prev) =>
                    prev.filter((error) => error.field !== 'name'),
                );
            }
        },
        [draft, persistDraft],
    );

    const updateSections = useCallback(
        (sections: GymPlanSection[]) => {
            if (!draft) return;

            persistDraft({
                ...draft,
                sections: sections.map((section, sectionIndex) => ({
                    ...section,
                    sortIndex: sectionIndex,
                    exercises: section.exercises.map(
                        (exercise, exerciseIndex) => ({
                            ...exercise,
                            sortIndex: exerciseIndex,
                        }),
                    ),
                })),
            });
            setErrors((prev) =>
                prev.filter((error) => error.field !== 'sections'),
            );
        },
        [draft, persistDraft],
    );

    const addSection = useCallback(() => {
        if (!draft) return;

        updateSections([...draft.sections, createSectionWithPlaceholders(1)]);
    }, [draft, updateSections]);

    const removeSection = useCallback(
        (sectionId: string) => {
            if (!draft) return;

            updateSections(
                draft.sections.filter((section) => section.id !== sectionId),
            );
        },
        [draft, updateSections],
    );

    const validate = (): ValidationError[] => {
        const nextErrors: ValidationError[] = [];

        if (!draft || draft.name.trim().length === 0) {
            nextErrors.push({
                field: 'name',
                message: t('gymPlanBuilder.validation.nameRequired'),
            });
        }

        if (!draft || draft.sections.length === 0) {
            nextErrors.push({
                field: 'sections',
                message: t('gymPlanBuilder.validation.sectionRequired'),
            });
        }

        draft?.sections.forEach((section, sectionIndex) => {
            if (section.exercises.length === 0) {
                nextErrors.push({
                    field: 'sections',
                    message: t(
                        'gymPlanBuilder.validation.sectionExerciseRequired',
                        { index: sectionIndex + 1 },
                    ),
                });
            }

            const hasPlaceholderExercise = section.exercises.some(
                isPlaceholderExercise,
            );
            if (hasPlaceholderExercise) {
                nextErrors.push({
                    field: 'sections',
                    message: t(
                        'gymPlanBuilder.validation.placeholderExerciseRequired',
                        { index: sectionIndex + 1 },
                    ),
                });
            }
        });

        setErrors(nextErrors);
        return nextErrors;
    };

    const saveDraft = () => {
        const validationErrors = validate();
        setValidationDismissalKey((prev) => prev + 1);
        if (validationErrors.length > 0) return;

        commitDraft.mutate(undefined, {
            onSuccess: (savedPlan) => {
                allowNextBack();
                router.replace(`/gymPlans/${savedPlan.id}`);
            },
        });
    };

    const topBarOptions = useMemo<readonly TopBarOption[]>(
        () => [
            isNotesVisible
                ? {
                      id: 'remove-note',
                      label: t('gymPlanBuilder.actions.removeNote'),
                      icon: 'trash',
                      destructive: true,
                      onPress: () => {
                          updateDraft({ description: undefined });
                          setNotesVisible(false);
                      },
                  }
                : {
                      id: 'add-note',
                      label: t('gymPlanBuilder.actions.addNote'),
                      icon: 'note',
                      onPress: () => setNotesVisible(true),
                  },
        ],
        [isNotesVisible, t, updateDraft],
    );

    const openSection = (sectionId: string) => {
        router.push({
            pathname: '/gymPlans/edit-section',
            params: { sectionId },
        });
    };

    const confirmRemoveSection = () => {
        if (removeSectionId) {
            removeSection(removeSectionId);
        }
        setRemoveSectionId(null);
    };

    const nameErrorMessage = errors.find(
        (error) => error.field === 'name',
    )?.message;
    const sectionErrorMessage = errors
        .filter((error) => error.field !== 'name')
        .map((error) => `• ${error.message}`)
        .join('\n');
    const mutationErrorMessage =
        commitDraft.error || upsertDraft.error
            ? t('gymPlanBuilder.validation.saveFailed')
            : '';
    const errorMessage = mutationErrorMessage || sectionErrorMessage;

    return {
        addSection,
        cancelLeave: () => setLeaveConfirmVisible(false),
        confirmDiscardAndLeave,
        confirmRemoveSection,
        definitionNameById,
        draft,
        errorMessage,
        isLeaveConfirmVisible,
        isNotesVisible,
        isSaving: commitDraft.isPending,
        leaveBuilder,
        mainContainerRef,
        nameErrorMessage,
        openSection,
        removeSectionId,
        saveDraft,
        setLeaveConfirmVisible,
        setRemoveSectionId,
        topBarOptions,
        updateDescription: (description) => updateDraft({ description }),
        updateName: (name) => updateDraft({ name }),
        validationDismissalKey,
    };
};
