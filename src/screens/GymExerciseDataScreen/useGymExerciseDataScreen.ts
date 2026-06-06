import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';
import { useGymExerciseDefinitions } from '@src/data/exerciseDefinitions';
import {
    useAddGymExerciseRecordSet,
    useDeleteGymExerciseRecordSet,
    useActiveGymSession,
    useUpdateGymExerciseRecordSet,
} from '@src/data/gymSessions';
import { useListSelection } from '@src/hooks/useListSelection';

import {
    DEFAULT_REPS,
    DEFAULT_WEIGHT_KG,
    draftFromSet,
    getPositiveValue,
    getSetDetails,
    getWeightGrams,
    inferTrackingFieldsFromSets,
} from './GymExerciseDataScreen.helpers';
import type { SetDraft, TrackingFields } from './GymExerciseDataScreen.types';

const getRecordIdParam = (recordId?: string | string[]): string | undefined => {
    if (Array.isArray(recordId)) {
        return recordId[0];
    }

    return recordId;
};

const getPreviousWeightKg = (
    previousSet: GymExerciseRecordSet | undefined,
): number => {
    if (previousSet?.weightGrams) {
        return previousSet.weightGrams / 1000;
    }

    return DEFAULT_WEIGHT_KG;
};

interface ClearTrackingFieldInput {
    distanceMeters?: null;
    durationSec?: null;
    id: string;
    reps?: null;
    weightGrams?: null;
}

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

    return set.distanceMeters !== undefined;
};

const getFieldsWithDataToRemove = (
    sets: GymExerciseRecordSet[],
    current: TrackingFields,
    draft: TrackingFields | null,
): (keyof TrackingFields)[] => {
    if (!draft) {
        return [];
    }

    return getRemovedTrackingFields(current, draft).filter((field) =>
        sets.some((set) => setHasTrackingFieldData(set, field)),
    );
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
    const { data: exerciseDefinitions = [] } = useGymExerciseDefinitions();
    const [trackingFields, setTrackingFields] =
        useState<TrackingFields>(() => inferTrackingFieldsFromSets(sets));
    const [draftTrackingFields, setDraftTrackingFields] =
        useState<TrackingFields | null>(null);
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
    const definition = exerciseDefinitions.find(
        (item) => item.id === record?.exerciseDefinitionId,
    );
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
            return t('gymExerciseData.errors.addSetFailed');
        }

        if (updateSet.error) {
            return t('gymExerciseData.errors.updateSetFailed');
        }

        if (deleteSet.error) {
            return t('gymExerciseData.errors.deleteSetFailed');
        }

        return '';
    };

    const updateDraftTrackingField = (field: keyof TrackingFields) => {
        setDraftTrackingFields((current) => {
            if (!current) return current;

            return {
                ...current,
                [field]: !current[field],
            };
        });
    };

    const openTrackingFieldsModal = () => {
        setDraftTrackingFields(trackingFields);
        setTrackingFieldsModalVisible(true);
    };

    const closeTrackingFieldsModal = () => {
        setDraftTrackingFields(null);
        setTrackingFieldsModalVisible(false);
    };

    const handleSaveTrackingFields = () => {
        if (!draftTrackingFields) return;

        const removedFields = getRemovedTrackingFields(
            trackingFields,
            draftTrackingFields,
        );

        for (const set of sets) {
            const shouldUpdateSet = removedFields.some((field) =>
                setHasTrackingFieldData(set, field),
            );

            if (!shouldUpdateSet) continue;

            const clearInput: ClearTrackingFieldInput = { id: set.id };

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

            updateSet.mutate(clearInput);
        }

        setTrackingFields(draftTrackingFields);
        closeTrackingFieldsModal();
    };

    const fieldsWithDataToRemove = getFieldsWithDataToRemove(
        sets,
        trackingFields,
        draftTrackingFields,
    );

    const handleAddSet = () => {
        if (!record) return;

        const previousSet = sets.at(-1);
        const previousWeightKg = getPreviousWeightKg(previousSet);
        const nextReps = previousSet?.reps ?? DEFAULT_REPS;
        const nextDurationSec = previousSet?.durationSec;
        const nextDistanceMeters = previousSet?.distanceMeters;
        const nextWeightGrams = getWeightGrams(previousWeightKg);
        const hasMeaningfulValue =
            (trackingFields.hasReps && nextReps > 0) ||
            (trackingFields.hasWeight && nextWeightGrams !== undefined) ||
            (trackingFields.hasDurationSec && nextDurationSec !== undefined) ||
            (trackingFields.hasDistanceMeters &&
                nextDistanceMeters !== undefined);

        if (!hasMeaningfulValue) return;

        const distanceMeters = trackingFields.hasDistanceMeters ? nextDistanceMeters : undefined;
        const durationSec = trackingFields.hasDurationSec ? nextDurationSec : undefined;
        const reps = trackingFields.hasReps && nextReps > 0 ? nextReps : undefined;
        const weightGrams = trackingFields.hasWeight ? nextWeightGrams : undefined;

        addSet.mutate({
            distanceMeters,
            durationSec,
            exerciseRecordId: record.id,
            reps,
            weightGrams,
        });
    };

    const handleSaveDraft = () => {
        if (!editingDraft) return;

        const draftDistanceMeters = getPositiveValue(editingDraft.distanceMeters);
        const draftDurationSec = getPositiveValue(editingDraft.durationSec);
        const draftReps = getPositiveValue(editingDraft.reps);
        const draftWeightGrams = getWeightGrams(editingDraft.weightKg);
        const distanceMeters = trackingFields.hasDistanceMeters ? draftDistanceMeters : undefined;
        const durationSec = trackingFields.hasDurationSec ? draftDurationSec : undefined;
        const reps = trackingFields.hasReps ? draftReps : undefined;
        const weightGrams = trackingFields.hasWeight ? draftWeightGrams : undefined;

        updateSet.mutate(
            {
                distanceMeters,
                durationSec,
                id: editingDraft.id,
                reps,
                weightGrams,
            },
            {
                onSuccess: () => setEditingDraft(null),
            },
        );
    };

    const handleToggleCompleteSet = (set: GymExerciseRecordSet) => {
        if (!record) return;

        if (set.completedAtMs !== undefined) {
            updateSet.mutate({
                id: set.id,
                completedAtMs: null,
            });
            return;
        }

        updateSet.mutate({
            id: set.id,
            completedAtMs: Date.now(),
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

    const handleConfirmDeleteSets = () => {
        if (pendingDeleteSets.length === 0) return;

        for (const set of pendingDeleteSets) {
            deleteSet.mutate(set.id);
        }

        setPendingDeleteSets([]);
        if (isSelectMode) {
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
        draftTrackingFields,
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
        fieldsWithDataToRemove,
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
        updateDraftTrackingField,
        getSetDetails: (set: GymExerciseRecordSet) => getSetDetails(set, t),
    };
};
