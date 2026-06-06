import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import type { MainContainerHandle } from '@src/components/layout/MainContainer/MainContainer';
import type { GymPlan } from '@src/core/entities/gymPlan.interfaces';
import {
    createEmptyGymPlanSection,
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
    planNameInput: string;
    planTitle: string;
    removeSectionId: string | null;
    saveDraft: () => void;
    commitPlanNameInput: () => void;
    setLeaveConfirmVisible: (isVisible: boolean) => void;
    setRemoveSectionId: (sectionId: string | null) => void;
    topBarOptions: readonly TopBarOption[];
    updateDescription: (description: string) => void;
    updatePlanNameInput: (name: string) => void;
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
    const draft = useGymPlanBuilderStore((state) => state.draft);
    const clearDraft = useGymPlanBuilderStore((state) => state.clearDraft);
    const hydrateDraft = useGymPlanBuilderStore((state) => state.hydrateDraft);
    const removeSectionFromDraft = useGymPlanBuilderStore(
        (state) => state.removeSection,
    );
    const setDraft = useGymPlanBuilderStore((state) => state.setDraft);
    const updateDraft = useGymPlanBuilderStore((state) => state.updateDraft);
    const [isNotesVisible, setNotesVisible] = useState(false);
    const [planNameInput, setPlanNameInput] = useState('');
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
            setPlanNameInput('');
            setNotesVisible(false);
            return;
        }

        setPlanNameInput(draft.name);
        if ((draft.description?.trim().length ?? 0) > 0) {
            setNotesVisible(true);
        }
    }, [draft]);

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

    const commitPlanNameInput = useCallback(() => {
        updateDraftAndClearErrors({ name: planNameInput.trim() });
    }, [planNameInput, updateDraftAndClearErrors]);

    const addSection = useCallback(() => {
        const section = createEmptyGymPlanSection();
        setDraft((currentDraft) => {
            if (!currentDraft) return currentDraft;

            return {
                ...currentDraft,
                sections: [
                    ...currentDraft.sections,
                    {
                        ...section,
                        sortIndex: currentDraft.sections.length,
                    },
                ],
            };
        });
        router.push({
            pathname: '/gymPlans/edit-section',
            params: { sectionId: section.id },
        });
        setErrors((prev) => prev.filter((error) => error.field !== 'sections'));
    }, [router, setDraft]);

    const validate = (nameOverride?: string): ValidationError[] => {
        const nextErrors: ValidationError[] = [];

        const name = nameOverride ?? draft?.name ?? '';
        if (!draft || name.trim().length === 0) {
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
        const nextName = planNameInput.trim();
        updateDraftAndClearErrors({ name: nextName });
        const validationErrors = validate(nextName);
        setValidationDismissalKey((prev) => prev + 1);
        if (!draft) return;
        if (validationErrors.length > 0) return;

        upsertDraft.mutate(stripPlaceholderGymPlanExercises(
            {
                ...draft,
                name: nextName,
            },
        ), {
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
    const trimmedPlanName = draft?.name.trim() ?? '';
    let planTitle = t('gymPlanBuilder.title');
    if (trimmedPlanName.length > 0) {
        planTitle = trimmedPlanName;
    }

    return {
        addSection,
        cancelLeave: () => setLeaveConfirmVisible(false),
        commitPlanNameInput,
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
        planNameInput,
        planTitle,
        removeSectionId,
        saveDraft,
        setLeaveConfirmVisible,
        setRemoveSectionId,
        topBarOptions,
        updateDescription: (description) =>
            updateDraftAndClearErrors({ description }),
        updatePlanNameInput: setPlanNameInput,
        validationDismissalKey,
    };
};
