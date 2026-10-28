import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';
import {
    useExerciseDefinition,
    useExerciseDefinitionLastWeightSet,
} from '@src/data/exerciseDefinitions';
import {
    fieldsFromTrackingFieldValue,
    trackingFieldValueFromFields,
    exerciseTrackingFieldDefinitions,
} from '@src/core/entities/exerciseTrackingFields';
import {
    useAddGymExerciseRecordSet,
    useDeleteGymExerciseRecordSet,
    useActiveGymSession,
    useUpdateGymExerciseRecordSet,
    useUpdateGymExerciseRecordTrackingDefaults,
    isGymError,
    createGymError,
    gymErrors,
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
    DEFAULT_DISTANCE_METERS,
    DEFAULT_DURATION_SEC,
    DEFAULT_REPS,
    DEFAULT_RPE_TENTHS,
    DEFAULT_WEIGHT_KG,
} from 'src/helpers/exerciseDefinition.helpers';
import { getWeightGrams } from 'src/helpers/gymExerciseRecord.helpers';
import type { GymError } from 'src/db/repositories/gyms/gymErrors';
import { useElapsedDuration } from '@src/hooks/useElapsedDuration';

const getRecordIdParam = (recordId?: string | string[]): string | undefined => {
    if (Array.isArray(recordId)) {
        return recordId[0];
    }

    return recordId;
};

export const useGymExerciseDataScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams<{ recordId?: string | string[] }>();
    const recordId = getRecordIdParam(params.recordId);
    const addSet = useAddGymExerciseRecordSet();
    const updateSet = useUpdateGymExerciseRecordSet();
    const updateTrackingDefaults =
        useUpdateGymExerciseRecordTrackingDefaults();
    const deleteSet = useDeleteGymExerciseRecordSet();
    const { data: activeSession } = useActiveGymSession();
    const elapsedDuration = useElapsedDuration(activeSession?.startedAtMs);
    const record = activeSession?.exerciseRecords.find(
        (item) => item.id === recordId,
    );
    const sets = record?.sets ?? [];
    const { data: definition } = useExerciseDefinition(
        record?.exerciseDefinitionId,
    );
    const { data: lastWeightSet } = useExerciseDefinitionLastWeightSet(
        record?.exerciseDefinitionId,
    );
    const [trackingFieldsOverride, setTrackingFields] =
        useState<TrackingFields | null>(null);
    const incompleteSets = sets.filter((set) => set.completedAtMs === undefined);
    let fieldsSource = sets;
    if (incompleteSets.length > 0) fieldsSource = incompleteSets;
    const inferredFields = inferTrackingFieldsFromSets(fieldsSource);
    let initialFields = inferredFields;
    if (
        fieldsSource.length === 0 ||
        !Object.values(inferredFields).some(Boolean)
    ) {
        initialFields = trackingFieldValueFromFields(
            definition?.data?.defaultTrackingFields ?? [],
        );
    }
    const trackingFields = trackingFieldsOverride ?? initialFields;
    let incompleteFields = trackingFieldValueFromFields([]);
    if (incompleteSets.length > 0) {
        incompleteFields = inferTrackingFieldsFromSets(incompleteSets);
    }
    const fieldsWithData = exerciseTrackingFieldDefinitions
        .filter((field) => incompleteFields[field.key])
        .map((field) => field.key);
    const [isTrackingFieldsModalVisible, setTrackingFieldsModalVisible] =
        useState(false);
    const [editingDraft, setEditingDraft] = useState<SetDraft | null>(null);
    const [pendingDeleteSets, setPendingDeleteSets] = useState<
        GymExerciseRecordSet[]
    >([]);
    const [errorValue, setErrorValue] = useState<GymError | null>(null);
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

    useEffect(() => {
        setTrackingFields(null);
    }, [recordId]);
    const completedSetCount = sets.filter(
        (set) => set.completedAtMs !== undefined,
    ).length;
    const isExerciseComplete =
        sets.length > 0 && completedSetCount === sets.length;
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

        if (updateTrackingDefaults.error) {
            return t('gymExerciseData.errors.updateSetFailed');
        }

        if (errorValue) {
            if (isGymError(errorValue)) {
                return t(errorValue.message);
            }
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
        value: TrackingFields,
    ): Promise<void> => {
        if (!definition || !record) return;
        const fields = fieldsFromTrackingFieldValue(value);

        try {
            await updateTrackingDefaults.mutateAsync({
                defaultTargetSet: definition.data?.defaultTargetSet,
                defaultTrackingFields: fields,
                exerciseRecordId: record.id,
            });
            setTrackingFields(value);
            closeTrackingFieldsModal();
        } catch {
            return;
        }
    };

    const handleAddSet = () => {
        if (!record) return;

        const previousSet = sets.at(-1);
        let nextDistanceMeters: number | undefined;
        let nextDurationSec: number | undefined;
        let nextReps: number | undefined;
        let nextRpeTenths: number | undefined;
        let nextWeightGrams: number | undefined;

        if (trackingFields.hasDistanceMeters) {
            nextDistanceMeters =
                previousSet?.distanceMeters ??
                definition?.data?.defaultTargetSet?.distanceMeters ??
                DEFAULT_DISTANCE_METERS;
        }

        if (trackingFields.hasDurationSec) {
            nextDurationSec =
                previousSet?.durationSec ??
                definition?.data?.defaultTargetSet?.durationSec ??
                DEFAULT_DURATION_SEC;
        }

        if (trackingFields.hasReps) {
            nextReps =
                previousSet?.reps ??
                definition?.data?.defaultTargetSet?.reps ??
                DEFAULT_REPS;
        }

        if (trackingFields.hasRpe) {
            nextRpeTenths =
                previousSet?.rpeTenths ??
                definition?.data?.defaultTargetSet?.rpeTenths ??
                DEFAULT_RPE_TENTHS;
        }

        if (trackingFields.hasWeight) {
            nextWeightGrams =
                previousSet?.weightGrams ??
                definition?.data?.defaultTargetSet?.weightGrams ??
                getWeightGrams(DEFAULT_WEIGHT_KG);
        }

        const hasMeaningfulValue =
            (nextReps !== undefined && nextReps > 0) ||
            nextWeightGrams !== undefined ||
            nextDurationSec !== undefined ||
            nextDistanceMeters !== undefined ||
            nextRpeTenths !== undefined;

        if (!hasMeaningfulValue) {
            setErrorValue(createGymError(gymErrors.invalidGymSet));
            return;
        }

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
        const distanceMeters = editingTrackingFields.hasDistanceMeters ? draftDistanceMeters : undefined;
        const durationSec = editingTrackingFields.hasDurationSec ? draftDurationSec : undefined;
        const reps = editingTrackingFields.hasReps ? draftReps : undefined;
        const weightGrams = editingTrackingFields.hasWeight ? draftWeightGrams : undefined;
        const rpeTenths = editingTrackingFields.hasRpe ? draftRpeTenths : undefined;

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
        updateTrackingDefaults.reset();
        setErrorValue(null);
    };

    let editingTrackingFields = trackingFields;
    const completedEditingSet = sets.find(
        (set) => set.id === editingDraft?.id && set.completedAtMs !== undefined,
    );
    if (completedEditingSet) {
        editingTrackingFields = inferTrackingFieldsFromSets([completedEditingSet]);
    }

    return {
        completedSetCount,
        closeTrackingFieldsModal,
        deleteConfirmMessage: getDeleteConfirmMessage(),
        deleteConfirmTitle: getDeleteConfirmTitle(),
        editingDraft,
        elapsedDuration,
        enterSelectMode,
        errorMessage: getErrorMessage(),
        exerciseName,
        weightPr: trackingFields.hasWeight ? definition?.stats?.weightPr : undefined,
        lastWeightSet: trackingFields.hasWeight ? lastWeightSet : undefined,
        openExerciseDetails: () => {
            if (!definition) return;
            router.push({
                pathname: '/exercise-definitions/[id]',
                params: { id: definition.id },
            });
        },
        exitSelectMode,
        handleAddSet,
        handleBack: () => router.back(),
        handleBackToSession: () => router.dismissTo('/gymSession'),
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
        isAddingSet: addSet.isPending,
        isDeletingSet: (set: GymExerciseRecordSet) =>
            deleteSet.isPending && deleteSet.variables === set.id,
        isCompletingSet: (set: GymExerciseRecordSet) =>
            updateSet.isPending && updateSet.variables.id === set.id,
        isExerciseComplete,
        isSavingSet:
            updateSet.isPending || updateTrackingDefaults.isPending,
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
        fieldsWithData,
        editingTrackingFields,
        getSetDetails: (set: GymExerciseRecordSet) => getSetDetails(set, t),
    };
};
