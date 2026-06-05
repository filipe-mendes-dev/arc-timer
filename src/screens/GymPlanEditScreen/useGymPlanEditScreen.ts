import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import type { MainContainerHandle } from '@src/components/layout/MainContainer/MainContainer';
import type { GymPlan } from '@src/core/entities/gym.interfaces';
import {
    createGymPlanPlaceholderExercise,
    createGymPlanSectionWithPlaceholders,
    isPlaceholderGymPlanExercise,
    stripPlaceholderGymPlanExercises,
} from '@src/core/gyms/gymPlanDrafts';
import {
    useCommitGymPlanDraft,
    useDiscardGymPlanDraft,
    useDraftGymPlan,
    useUpsertDraftGymPlan,
} from '@src/data/gymPlans';
import { useGymExerciseDefinitions } from '@src/data/gymSessions';
import { useSystemBackHandler } from '@src/hooks/navigation/useSystemBackHandler';
import { useGymPlanBuilderStore } from '@src/state/stores/useGymPlanBuilderStore';

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

export const useGymPlanEditScreen = (): UseGymPlanEditScreenResult => {
    const { t } = useTranslation();
    const router = useRouter();
    const draftQuery = useDraftGymPlan();
    const upsertDraft = useUpsertDraftGymPlan();
    const commitDraft = useCommitGymPlanDraft();
    const discardDraft = useDiscardGymPlanDraft();
    const { data: allExerciseDefinitions = [] } = useGymExerciseDefinitions();
    const addSectionToDraft = useGymPlanBuilderStore(
        (state) => state.addSection,
    );
    const draft = useGymPlanBuilderStore((state) => state.draft);
    const clearDraft = useGymPlanBuilderStore((state) => state.clearDraft);
    const hydrateDraft = useGymPlanBuilderStore((state) => state.hydrateDraft);
    const removeSectionFromDraft = useGymPlanBuilderStore(
        (state) => state.removeSection,
    );
    const updateDraft = useGymPlanBuilderStore((state) => state.updateDraft);
    const updateSections = useGymPlanBuilderStore(
        (state) => state.updateSections,
    );
    const [isNotesVisible, setNotesVisible] = useState(false);
    const [removeSectionId, setRemoveSectionId] = useState<string | null>(null);
    const [isLeaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [validationDismissalKey, setValidationDismissalKey] = useState(0);
    const mainContainerRef = useRef<MainContainerHandle | null>(null);

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
        if (draft) return;
        if (!draftQuery.data) return;

        hydrateDraft(draftQuery.data, 'edit');
    }, [draft, draftQuery.data, hydrateDraft]);

    useEffect(() => {
        if (!draft) {
            setNotesVisible(false);
            return;
        }

        if ((draft.description?.trim().length ?? 0) > 0) {
            setNotesVisible(true);
        }
    }, [draft]);

    useEffect(() => {
        if (!draft) return;

        const shouldCreateSection = draft.sections.length === 0;
        if (shouldCreateSection) {
            updateSections([createGymPlanSectionWithPlaceholders()]);
            return;
        }

        const hasEmptySection = draft.sections.some(
            (section) => section.exercises.length === 0,
        );
        if (!hasEmptySection) return;

        updateSections(
            draft.sections.map((section) => {
                if (section.exercises.length > 0) return section;

                return {
                    ...section,
                    exercises: [createGymPlanPlaceholderExercise(1)],
                };
            }),
        );
    }, [draft, updateSections]);

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
            onSuccess: () => {
                clearDraft();
                leaveBuilder();
            },
        });
    }, [clearDraft, discardDraft, leaveBuilder]);

    const updateDraftAndClearErrors = useCallback(
        (patch: Partial<GymPlan>) => {
            updateDraft(patch);
            if (patch.name !== undefined) {
                setErrors((prev) =>
                    prev.filter((error) => error.field !== 'name'),
                );
            }
        },
        [updateDraft],
    );

    const addSection = useCallback(() => {
        addSectionToDraft();
        setErrors((prev) => prev.filter((error) => error.field !== 'sections'));
    }, [addSectionToDraft]);

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
                isPlaceholderGymPlanExercise,
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
        if (!draft) return;

        upsertDraft.mutate(stripPlaceholderGymPlanExercises(draft), {
            onSuccess: () => {
                commitDraft.mutate(undefined, {
                    onSuccess: (savedPlan) => {
                        clearDraft();
                        allowNextBack();
                        router.replace(`/gymPlans/${savedPlan.id}`);
                    },
                });
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
                          updateDraftAndClearErrors({
                              description: undefined,
                          });
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
        [isNotesVisible, t, updateDraftAndClearErrors],
    );

    const openSection = (sectionId: string) => {
        router.push({
            pathname: '/gymPlans/edit-section',
            params: { sectionId },
        });
    };

    const confirmRemoveSection = () => {
        if (removeSectionId) {
            removeSectionFromDraft(removeSectionId);
            setErrors((prev) =>
                prev.filter((error) => error.field !== 'sections'),
            );
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
        commitDraft.error || upsertDraft.error || discardDraft.error
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
        isSaving: commitDraft.isPending || upsertDraft.isPending,
        leaveBuilder,
        mainContainerRef,
        nameErrorMessage,
        openSection,
        removeSectionId,
        saveDraft,
        setLeaveConfirmVisible,
        setRemoveSectionId,
        topBarOptions,
        updateDescription: (description) =>
            updateDraftAndClearErrors({ description }),
        updateName: (name) => updateDraftAndClearErrors({ name }),
        validationDismissalKey,
    };
};
