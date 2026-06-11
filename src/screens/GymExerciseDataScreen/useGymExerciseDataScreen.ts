import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';
import { useExerciseDefinition } from '@src/data/exerciseDefinitions';
import {
    useAddGymExerciseRecordSet,
    useDeleteGymExerciseRecordSet,
    useActiveGymSession,
    useUpdateGymExerciseRecordSet,
    isGymError,
} from '@src/data/gymSessions';
import { useListSelection } from '@src/hooks/useListSelection';

import {
    draftFromSet,
    getPositiveValue,
    getSetDetails,
    inferTrackingFieldsFromSets,
} from './GymExerciseDataScreen.helpers';
import type { SetDraft, TrackingFields } from './GymExerciseDataScreen.types';
import {
    DEFAULT_REPS,
    DEFAULT_WEIGHT_KG,
} from 'src/helpers/exerciseDefinition.helpers';
import { getWeightGrams } from 'src/helpers/gymExerciseRecord.helpers';
import type { UpdateExerciseRecordSetInput } from 'src/db/services/gyms/gymSessionServiceFactory';

const getRecordIdParam = (recordId?: string | string[]): string | undefined => {
    if (Array.isArray(recordId)) {
        return recordId[0];
    }

    return recordId;
};

const getFirstSetWeightGrams = (
    weightPrGrams: number | undefined,
): number | undefined => weightPrGrams ?? getWeightGrams(DEFAULT_WEIGHT_KG);

const getNextWeightGrams = (
    previousSet: GymExerciseRecordSet | undefined,
    weightPrGrams: number | undefined,
): number | undefined =>
    previousSet
        ? previousSet.weightGrams
        : getFirstSetWeightGrams(weightPrGrams);

const getRemovedTrackingFields = (
    current: TrackingFields,
    draft: TrackingFields,
): (keyof TrackingFields)[] => {
    const removedFields: (keyof TrackingFields)[] = [];

    if (current.hasReps && !draft.hasReps) {
        removedFields.push('hasReps');
    }

    if (current.hasWeight && !draft.hasWeight) {
        removedFields.push('hasWeight');
    }

    if (current.hasDurationSec && !draft.hasDurationSec) {
        removedFields.push('hasDurationSec');
    }

    if (current.hasDistanceMeters && !draft.hasDistanceMeters) {
        removedFields.push('hasDistanceMeters');
    }

    if (current.hasRpe && !draft.hasRpe) {
        removedFields.push('hasRpe');
    }

    return removedFields;
};

const setHasTrackingFieldData = (
    set: GymExerciseRecordSet,
    field: keyof TrackingFields,
): boolean => {
    if (field === 'hasReps') {
        return set.reps !== undefined;
    }

    if (field === 'hasWeight') {
        return set.weightGrams !== undefined;
    }

    if (field === 'hasDurationSec') {
        return set.durationSec !== undefined;
    }

    if (field === 'hasDistanceMeters') {
        return set.distanceMeters !== undefined;
    }

    return set.rpeTenths !== undefined;
};

const getFieldsWithData = (
    sets: GymExerciseRecordSet[],
): (keyof TrackingFields)[] => {
    const fieldsWithData: (keyof TrackingFields)[] = [];

    if (sets.some((set) => setHasTrackingFieldData(set, 'hasReps'))) {
        fieldsWithData.push('hasReps');
    }
    if (sets.some((set) => setHasTrackingFieldData(set, 'hasWeight'))) {
        fieldsWithData.push('hasWeight');
    }
    if (sets.some((set) => setHasTrackingFieldData(set, 'hasDurationSec'))) {
        fieldsWithData.push('hasDurationSec');
    }
    if (sets.some((set) => setHasTrackingFieldData(set, 'hasDistanceMeters'))) {
        fieldsWithData.push('hasDistanceMeters');
    }
    if (sets.some((set) => setHasTrackingFieldData(set, 'hasRpe'))) {
        fieldsWithData.push('hasRpe');
    }

    return fieldsWithData;
};

export const useGymExerciseDataScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams<{ recordId?: string | string[] }>();
    const recordId = getRecordIdParam(params.recordId);
    const addSet = useAddGymExerciseRecordSet();
    const updateSet = useUpdateGymExerciseRecordSet();
    const deleteSet = useDeleteGymExerciseRecordSet();
    const { data: activeSession } = useActiveGymSession();
    const record = activeSession?.exerciseRecords.find(
        (item) => item.id === recordId,
    );
    const sets = record?.sets ?? [];
    const { data: definition } = useExerciseDefinition(
        record?.exerciseDefinitionId,
    );
    const [trackingFields, setTrackingFields] = useState<TrackingFields>(() =>
        inferTrackingFieldsFromSets(sets),
    );
    const [isTrackingFieldsModalVisible, setTrackingFieldsModalVisible] =
        useState(false);
    const [editingDraft, setEditingDraft] = useState<SetDraft | null>(null);
    const [pendingDeleteSets, setPendingDeleteSets] = useState<
        GymExerciseRecordSet[]
    >([]);
    const {
        enterSelectMode,
        exitSelectMode,
        hasSelection,
        isSelectMode,
        isSelected,
        selectAll,
        selectedCount,
        selectedIds,
        toggleItem,
    } = useListSelection();
    const exerciseName =
        definition?.name ?? t('gymExerciseData.exerciseFallback');
    const completedSetCount = sets.filter(
        (set) => set.completedAtMs !== undefined,
    ).length;
    const getDeleteConfirmTitle = (): string => {
        if (pendingDeleteSets.length > 1) {
            return t('gymExerciseData.deleteConfirmBulk.title', {
                count: pendingDeleteSets.length,
            });
        }

        return t('gymExerciseData.deleteConfirm.title');
    };

    const getDeleteConfirmMessage = (): string => {
        if (pendingDeleteSets.length > 1) {
            return t('gymExerciseData.deleteConfirmBulk.message', {
                count: pendingDeleteSets.length,
            });
        }

        return t('gymExerciseData.deleteConfirm.message');
    };

    const getErrorMessage = (): string => {
        if (addSet.error) {
            if (isGymError(addSet.error)) {
                return t(addSet.error.message);
            }

            return t('gymExerciseData.errors.addSetFailed');
        }

        if (updateSet.error) {
            if (isGymError(updateSet.error)) {
                return t(updateSet.error.message);
            }

            return t('gymExerciseData.errors.updateSetFailed');
        }

        if (deleteSet.error) {
            if (isGymError(deleteSet.error)) {
                return t(deleteSet.error.message);
            }

            return t('gymExerciseData.errors.deleteSetFailed');
        }

        return '';
    };

    const openTrackingFieldsModal = () => {
        setTrackingFieldsModalVisible(true);
    };

    const closeTrackingFieldsModal = () => {
        setTrackingFieldsModalVisible(false);
    };

    const handleSaveTrackingFields = async (
        nextTrackingFields: TrackingFields,
    ): Promise<void> => {
        const removedFields = getRemovedTrackingFields(
            trackingFields,
            nextTrackingFields,
        );

        try {
            for (const set of sets) {
                const shouldUpdateSet = removedFields.some((field) =>
                    setHasTrackingFieldData(set, field),
                );

                if (!shouldUpdateSet) continue;

                const clearInput: UpdateExerciseRecordSetInput = { ...set };

                if (removedFields.includes('hasDistanceMeters')) {
                    clearInput.distanceMeters = null;
                }

                if (removedFields.includes('hasDurationSec')) {
                    clearInput.durationSec = null;
                }

                if (removedFields.includes('hasReps')) {
                    clearInput.reps = null;
                }

                if (removedFields.includes('hasWeight')) {
                    clearInput.weightGrams = null;
                }

                if (removedFields.includes('hasRpe')) {
                    clearInput.rpeTenths = null;
                }

                await updateSet.mutateAsync(clearInput);
            }

            setTrackingFields(nextTrackingFields);
        } catch {
        } finally {
            closeTrackingFieldsModal();
        }
    };

    const fieldsWithData = getFieldsWithData(sets);

    const handleAddSet = () => {
        if (!record) return;

        const previousSet = sets.at(-1);
        let nextDistanceMeters: number | undefined;
        let nextDurationSec: number | undefined;
        let nextReps: number | undefined;
        let nextRpeTenths: number | undefined;
        let nextWeightGrams: number | undefined;

        if (trackingFields.hasDistanceMeters) {
            nextDistanceMeters = previousSet?.distanceMeters;
        }

        if (trackingFields.hasDurationSec) {
            nextDurationSec = previousSet?.durationSec;
        }

        if (trackingFields.hasReps) {
            nextReps = previousSet?.reps ?? DEFAULT_REPS;
        }

        if (trackingFields.hasRpe) {
            nextRpeTenths = previousSet?.rpeTenths;
        }

        if (trackingFields.hasWeight) {
            nextWeightGrams = getNextWeightGrams(
                previousSet,
                definition?.stats?.weightPr?.value,
            );
        }

        const hasMeaningfulValue =
            (nextReps !== undefined && nextReps > 0) ||
            nextWeightGrams !== undefined ||
            nextDurationSec !== undefined ||
            nextDistanceMeters !== undefined ||
            nextRpeTenths !== undefined;

        if (!hasMeaningfulValue) return;

        let reps: number | undefined;

        if (nextReps !== undefined && nextReps > 0) {
            reps = nextReps;
        }

        addSet.mutate({
            distanceMeters: nextDistanceMeters,
            durationSec: nextDurationSec,
            exerciseRecordId: record.id,
            reps,
            rpeTenths: nextRpeTenths,
            weightGrams: nextWeightGrams,
        });
    };

    const handleSaveDraft = () => {
        if (!editingDraft) return;

        const draftDistanceMeters = getPositiveValue(
            editingDraft.distanceMeters,
        );
        const draftDurationSec = getPositiveValue(editingDraft.durationSec);
        const draftReps = getPositiveValue(editingDraft.reps);
        const draftRpeTenths = getPositiveValue(editingDraft.rpeTenths);
        const draftWeightGrams = getWeightGrams(editingDraft.weightKg);
        const distanceMeters = trackingFields.hasDistanceMeters
            ? draftDistanceMeters
            : undefined;
        const durationSec = trackingFields.hasDurationSec
            ? draftDurationSec
            : undefined;
        const reps = trackingFields.hasReps ? draftReps : undefined;
        const weightGrams = trackingFields.hasWeight
            ? draftWeightGrams
            : undefined;
        const rpeTenths = trackingFields.hasRpe ? draftRpeTenths : undefined;

        updateSet.mutate(
            {
                distanceMeters,
                durationSec,
                id: editingDraft.id,
                reps,
                rpeTenths,
                weightGrams,
            },
            {
                onSuccess: () => setEditingDraft(null),
            },
        );
    };

    const handleToggleCompleteSet = (set: GymExerciseRecordSet): void => {
        if (!record) return;

        updateSet.mutate({
            ...set,
            completedAtMs: set.completedAtMs !== undefined ? null : Date.now(),
        });
    };

    const handleRequestDeleteSet = (set: GymExerciseRecordSet) => {
        setPendingDeleteSets([set]);
    };

    const handleEditSet = (set: GymExerciseRecordSet) => {
        setEditingDraft(draftFromSet(set));
    };

    const handleSelectSet = (set: GymExerciseRecordSet) => {
        toggleItem(set.id);
    };

    const handleRequestSelectedDelete = () => {
        setPendingDeleteSets(sets.filter((set) => selectedIds.has(set.id)));
    };

    const handleConfirmDeleteSets = async (): Promise<void> => {
        if (pendingDeleteSets.length === 0) return;

        const results = await Promise.allSettled(
            pendingDeleteSets.map((set) => deleteSet.mutateAsync(set.id)),
        );
        const failedSets = pendingDeleteSets.filter(
            (_set, index) => results[index].status === 'rejected',
        );

        setPendingDeleteSets(failedSets);
        if (isSelectMode && failedSets.length === 0) {
            exitSelectMode();
        }
    };

    const handleCloseError = () => {
        addSet.reset();
        updateSet.reset();
        deleteSet.reset();
    };

    return {
        completedSetCount,
        closeTrackingFieldsModal,
        deleteConfirmMessage: getDeleteConfirmMessage(),
        deleteConfirmTitle: getDeleteConfirmTitle(),
        editingDraft,
        enterSelectMode,
        errorMessage: getErrorMessage(),
        exerciseName,
        exitSelectMode,
        handleAddSet,
        handleBack: () => router.back(),
        handleBackToSession: () => router.replace('/gymSession'),
        handleCloseError,
        handleConfirmDeleteSets,
        handleCancelDeleteSets: () => setPendingDeleteSets([]),
        handleEditSet,
        handleRequestDeleteSet,
        handleRequestSelectedDelete,
        handleSaveDraft,
        handleSaveTrackingFields,
        handleSelectSet,
        handleToggleCompleteSet,
        hasSelection,
        fieldsWithData,
        isAddingSet: addSet.isPending,
        isDeletingSet: (set: GymExerciseRecordSet) =>
            deleteSet.isPending && deleteSet.variables === set.id,
        isCompletingSet: (set: GymExerciseRecordSet) =>
            updateSet.isPending && updateSet.variables.id === set.id,
        isSavingSet: updateSet.isPending,
        isSelectMode,
        isSelected,
        isTrackingFieldsModalVisible,
        openTrackingFieldsModal,
        pendingDeleteSets,
        record,
        selectAllSets: () => selectAll(sets.map((set) => set.id)),
        selectedCount,
        setEditingDraft,
        sets,
        t,
        trackingFields,
        getSetDetails: (set: GymExerciseRecordSet) => getSetDetails(set, t),
    };
};
