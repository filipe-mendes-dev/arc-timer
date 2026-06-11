import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { WorkoutBlock } from '@src/core/entities/workout.interfaces';
import { uid } from '@src/core/id';
import { useWorkoutDraftStore } from '@src/state/stores/useWorkoutDraftStore';
import {
    isWorkoutError,
    useUpsertWorkout,
    useWorkout,
} from '@src/data/workouts';

import { WorkoutBlockItem } from './components/WorkoutBlockItem/WorkoutBlockItem';
import { Button } from '@src/components/ui/Button/Button';
import {
    MainContainer,
    type MainContainerHandle,
} from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { TextField } from '@src/components/ui/TextField/TextField';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { useTheme } from '@src/theme/ThemeProvider';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import {
    getFieldError,
    formatErrorList,
} from '@src/core/validation/formErrors';
import type {
    WorkoutEditError,
    WorkoutEditField,
} from './EditWorkoutScreen.interfaces';
import { useTranslation } from 'react-i18next';
import { useValidationScroll } from '@src/hooks/useValidationScroll';
import { useSystemBackHandler } from '@src/hooks/navigation/useSystemBackHandler';

const createEmptyBlock = (): WorkoutBlock => ({
    id: uid(),
    title: '',
    sets: 3,
    restBetweenSetsSec: 30,
    restBetweenExercisesSec: 10,
    exercises: [
        {
            id: uid(),
            mode: 'time',
            value: 20,
        },
    ],
});

const EditWorkoutScreen = () => {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{
        id?: string;
    }>();
    const router = useRouter();

    const draft = useWorkoutDraftStore((state) => state.draft);
    const draftMode = useWorkoutDraftStore((state) => state.mode);
    const sourceWorkoutVersionId = useWorkoutDraftStore(
        (state) => state.sourceWorkoutVersionId,
    );
    const startDraftNew = useWorkoutDraftStore((state) => state.startDraftNew);
    const startDraftFromWorkout = useWorkoutDraftStore(
        (state) => state.startDraftFromWorkout,
    );
    const updateDraftMeta = useWorkoutDraftStore(
        (state) => state.updateDraftMeta,
    );
    const setDraftBlocks = useWorkoutDraftStore(
        (state) => state.setDraftBlocks,
    );
    const buildWorkoutFromDraft = useWorkoutDraftStore(
        (state) => state.buildWorkoutFromDraft,
    );
    const clearDraft = useWorkoutDraftStore((state) => state.clearDraft);
    const { data: savedWorkout } = useWorkout(id);
    const upsertWorkout = useUpsertWorkout();

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<WorkoutEditError[]>([]);
    const [blockToRemove, setBlockToRemove] = useState<string | null>(null);
    const [isLeaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
    const mainContainerRef = useRef<MainContainerHandle | null>(null);
    const [dismissalKey, setDismissalKey] = useState(0);

    const { theme } = useTheme();

    const { refFor, scrollToFirstError } =
        useValidationScroll<WorkoutEditField>({
            scrollTargetIntoView: (targetRef, viewportRatio) => {
                mainContainerRef.current?.scrollTargetIntoView(
                    targetRef,
                    viewportRatio,
                );
            },
        });

    useEffect(() => {
        if (id) {
            const hasMatchingEditDraft =
                draft?.id === id && draftMode === 'edit';

            if (savedWorkout && !hasMatchingEditDraft) {
                startDraftFromWorkout(savedWorkout);
            }
            return;
        }

        if (draft) return;

        startDraftNew();
    }, [
        draft,
        draftMode,
        id,
        savedWorkout,
        startDraftFromWorkout,
        startDraftNew,
    ]);

    const requestLeave = useCallback((): boolean => {
        if (!draft) return false;

        setLeaveConfirmVisible(true);
        return true;
    }, [draft]);

    const { allowNextBack } = useSystemBackHandler({
        onSystemBack: requestLeave,
    });

    const leaveEditor = useCallback(() => {
        if (requestLeave()) return;

        allowNextBack();
        router.back();
    }, [allowNextBack, requestLeave, router]);

    const confirmDiscardAndLeave = useCallback(() => {
        clearDraft();
        allowNextBack();
        router.back();
    }, [allowNextBack, clearDraft, router]);

    const name = draft?.name ?? t('editWorkout.defaults.newWorkout');
    const blocks = draft?.blocks ?? [];

    const onAddBlock = () => {
        if (!draft) return;

        setDraftBlocks([...draft.blocks, createEmptyBlock()]);
        setErrors((prev) => prev.filter((e) => e.field !== 'blocks'));
    };

    const onEditBlock = (blockId: string) => {
        router.push({
            pathname: '/workouts/edit-block',
            params: { blockId },
        });
    };

    const onRemoveBlock = (blockId: string) => {
        if (!draft) return;
        const next = draft.blocks.filter((b) => b.id !== blockId);
        setDraftBlocks(next);
    };

    const validate = (): WorkoutEditError[] => {
        const trimmedName = name.trim();

        const errs: WorkoutEditError[] = [];
        if (!trimmedName) {
            errs.push({
                field: 'name',
                message: t('editWorkout.validation.nameRequired'),
                targetId: 'name',
            });
        }
        if (blocks.length === 0) {
            errs.push({
                field: 'blocks',
                message: t('editWorkout.validation.addBlock'),
                targetId: 'blocks',
            });
        }
        const hasUnnamedExercise = blocks.some((block) =>
            block.exercises.some((exercise) => {
                const hasDefinition = !!exercise.exerciseDefinitionId;
                const hasName =
                    exercise.name !== undefined &&
                    exercise.name.trim().length > 0;

                return !hasDefinition && !hasName;
            }),
        );
        if (hasUnnamedExercise) {
            errs.push({
                field: 'exercises',
                message: t('editWorkout.validation.exerciseNamesRequired'),
                targetId: 'blocks',
            });
        }
        setErrors(errs);
        return errs;
    };

    const isEditingSavedWorkout = !!id;

    const onSave = async () => {
        if (saving) return;
        if (!draft) return;
        const validationErrors = validate();
        setDismissalKey((prev) => prev + 1);
        if (validationErrors.length) {
            scrollToFirstError(validationErrors);
            return;
        }

        setSaving(true);
        try {
            const workout = buildWorkoutFromDraft();
            if (!workout) return;

            await upsertWorkout.mutateAsync({
                workout,
                sourceWorkoutVersionId: sourceWorkoutVersionId ?? undefined,
            });
            clearDraft();
            allowNextBack();

            if (isEditingSavedWorkout) {
                router.back();
            } else {
                router.replace(`/workouts/${workout.id}`);
            }
        } catch (e) {
            const saveErrors: WorkoutEditError[] = [
                {
                    field: 'blocks',
                    message: isWorkoutError(e)
                        ? t(e.message)
                        : t('editWorkout.validation.saveFailed'),
                    targetId: 'blocks',
                },
            ];
            setErrors(saveErrors);
            setDismissalKey((prev) => prev + 1);
            scrollToFirstError(saveErrors);
        } finally {
            setSaving(false);
        }
    };

    const nameError = getFieldError(errors, 'name');

    const nonNameErrors = errors.filter((e) => e.field !== 'name');
    const bannerMessage = formatErrorList(nonNameErrors);

    return (
        <>
            <MainContainer
                ref={mainContainerRef}
                title={
                    isEditingSavedWorkout
                        ? t('editWorkout.title.edit')
                        : t('editWorkout.title.create')
                }
                gap={theme.layout.mainContainer.gap}
            >
                <TextField
                    ref={refFor('name')}
                    label={t('editWorkout.fields.name')}
                    value={name}
                    onChangeText={(value) => {
                        updateDraftMeta({ name: value });
                        // Clear only 'name' errors when user edits the name
                        setErrors((prev) =>
                            prev.filter((e) => e.field !== 'name'),
                        );
                    }}
                    placeholder={t('editWorkout.fields.namePlaceholder')}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    errorText={nameError?.message}
                />

                <ScreenSection
                    title={t('editWorkout.sections.blocks')}
                    gap={theme.layout.listItem.gap}
                >
                    <AppText variant="caption" tone="secondary">
                        {t('editWorkout.hints.tapBlockToEdit')}
                    </AppText>

                    <ErrorBanner
                        ref={refFor('blocks')}
                        message={bannerMessage}
                        isDismissible
                        dismissalKey={dismissalKey}
                    />

                    {blocks.map((block, index) => (
                        <WorkoutBlockItem
                            key={block.id}
                            block={block}
                            index={index}
                            onPress={onEditBlock}
                            onRemove={setBlockToRemove}
                            initiallyExpanded
                            isWiggling={true}
                        />
                    ))}

                    <Button
                        title={t('editWorkout.actions.addBlock')}
                        onPress={onAddBlock}
                        variant="secondary"
                    />
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('editWorkout.actions.cancel')}
                    variant="secondary"
                    onPress={leaveEditor}
                    flex={1}
                />
                <Button
                    title={
                        isEditingSavedWorkout
                            ? t('editWorkout.actions.save')
                            : t('editWorkout.actions.create')
                    }
                    variant="primary"
                    onPress={onSave}
                    loading={saving}
                    flex={1}
                />
            </FooterBar>

            <ConfirmDialog
                visible={blockToRemove != null}
                title={t('editWorkout.removeBlock.title')}
                message={t('editWorkout.removeBlock.message')}
                confirmLabel={t('editWorkout.removeBlock.confirm')}
                cancelLabel={t('editWorkout.removeBlock.cancel')}
                destructive
                onConfirm={() => {
                    if (blockToRemove) {
                        onRemoveBlock(blockToRemove);
                    }
                    setBlockToRemove(null);
                }}
                onCancel={() => setBlockToRemove(null)}
            />

            <ConfirmDialog
                visible={isLeaveConfirmVisible}
                title={t('editWorkout.discardConfirm.title')}
                message={t('editWorkout.discardConfirm.message')}
                confirmLabel={t('editWorkout.discardConfirm.confirm')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={confirmDiscardAndLeave}
                onCancel={() => setLeaveConfirmVisible(false)}
            />
        </>
    );
};

export default EditWorkoutScreen;
