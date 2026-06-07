import { useEffect, useMemo, useRef, useState } from 'react';

import type {
    ExerciseDefinition,
    ExerciseDefinitionTargetSetData,
    ExerciseTrackingField,
} from '@src/core/entities/exerciseDefinition.interfaces';
import { useSaveExerciseDefinitionData } from '@src/data/exerciseDefinitions';

import {
    applyValueToTargetSet,
    fieldsFromTrackingValue,
    formatMetric,
    formatRpe,
    formatWeight,
    targetSetFromDefinition,
    trackingFieldKeyByField,
    trackingFieldLabelKeyByField,
    trackingFields,
    type ExerciseDefinitionMetricItem,
    type ExerciseDefinitionTargetValue,
    type ExerciseDefinitionTrackingFields,
} from '../ExerciseDefinitionDetailsScreen.helpers';

interface UseExerciseDefinitionDefaultFieldsParams {
    definition?: ExerciseDefinition | null;
    emptyValue: string;
}

interface UseExerciseDefinitionDefaultFieldsResult {
    defaultMetricItems: ExerciseDefinitionMetricItem[];
    editingDefaultField: ExerciseTrackingField | null;
    fieldsWithDefaultData: readonly (keyof ExerciseDefinitionTrackingFields)[];
    isSavingDefaults: boolean;
    isTrackingFieldsModalVisible: boolean;
    trackingFieldValue: ExerciseDefinitionTrackingFields | null;
    closeDefaultValueModal: () => void;
    closeTrackingFieldsModal: () => void;
    openDefaultValueModal: (field: ExerciseTrackingField) => void;
    openTrackingFieldsModal: () => void;
    saveDefaultFieldValue: (
        field: ExerciseTrackingField,
        value: ExerciseDefinitionTargetValue,
    ) => Promise<void>;
    saveTrackingFields: (
        value: ExerciseDefinitionTrackingFields,
    ) => Promise<void>;
}

const getFormattedDefaultValue = (
    definition: ExerciseDefinition,
    field: ExerciseTrackingField,
    emptyValue: string,
): string => {
    const targetSet = definition.data?.defaultTargetSet;

    switch (field) {
        case 'reps':
            return formatMetric(targetSet?.reps) ?? emptyValue;
        case 'weight':
            return formatWeight(targetSet?.weightGrams) ?? emptyValue;
        case 'duration':
            return formatMetric(targetSet?.durationSec) ?? emptyValue;
        case 'distance':
            return formatMetric(targetSet?.distanceMeters) ?? emptyValue;
        case 'rpe':
            return formatRpe(targetSet?.rpeTenths) ?? emptyValue;
        default:
            return emptyValue;
    }
};

const hasDefaultValue = (
    definition: ExerciseDefinition,
    field: ExerciseTrackingField,
): boolean => {
    return hasTargetSetValue(definition.data?.defaultTargetSet, field);
};

const hasTargetSetValue = (
    targetSet: ExerciseDefinitionTargetSetData | undefined,
    field: ExerciseTrackingField,
): boolean => {
    switch (field) {
        case 'reps':
            return targetSet?.reps !== undefined;
        case 'weight':
            return targetSet?.weightGrams !== undefined;
        case 'duration':
            return targetSet?.durationSec !== undefined;
        case 'distance':
            return targetSet?.distanceMeters !== undefined;
        case 'rpe':
            return targetSet?.rpeTenths !== undefined;
        default:
            return false;
    }
};

const trackingFieldsFromSelectedFields = (
    selectedFields: readonly ExerciseTrackingField[],
): ExerciseDefinitionTrackingFields => ({
    hasDistanceMeters: selectedFields.includes('distance'),
    hasDurationSec: selectedFields.includes('duration'),
    hasReps: selectedFields.includes('reps'),
    hasRpe: selectedFields.includes('rpe'),
    hasWeight: selectedFields.includes('weight'),
});

const getSelectedFieldsWithValues = (
    definition: ExerciseDefinition,
    selectedFields: readonly ExerciseTrackingField[],
): ExerciseTrackingField[] =>
    selectedFields.filter((field) => hasDefaultValue(definition, field));

export const useExerciseDefinitionDefaultFields = ({
    definition,
    emptyValue,
}: UseExerciseDefinitionDefaultFieldsParams): UseExerciseDefinitionDefaultFieldsResult => {
    const saveData = useSaveExerciseDefinitionData();
    const [isTrackingFieldsModalVisible, setTrackingFieldsModalVisible] =
        useState(false);
    const [editingDefaultField, setEditingDefaultField] =
        useState<ExerciseTrackingField | null>(null);
    const [selectedFields, setSelectedFields] = useState<
        ExerciseTrackingField[]
    >([]);
    const selectedFieldsDefinitionIdRef = useRef<string | null>(null);
    const trackingFieldValue = definition
        ? trackingFieldsFromSelectedFields(selectedFields)
        : null;

    useEffect(() => {
        if (!definition) {
            selectedFieldsDefinitionIdRef.current = null;
            setSelectedFields([]);
            return;
        }

        if (selectedFieldsDefinitionIdRef.current === definition.id) return;

        selectedFieldsDefinitionIdRef.current = definition.id;
        setSelectedFields(definition.data?.defaultTrackingFields ?? []);
    }, [definition]);

    const defaultMetricItems = useMemo<ExerciseDefinitionMetricItem[]>(() => {
        if (!definition) return [];

        return trackingFields
            .filter((field) => selectedFields.includes(field))
            .map((field) => ({
                field,
                labelKey: trackingFieldLabelKeyByField[field],
                value: getFormattedDefaultValue(definition, field, emptyValue),
            }));
    }, [definition, emptyValue, selectedFields]);

    const fieldsWithDefaultData = useMemo<
        readonly (keyof ExerciseDefinitionTrackingFields)[]
    >(() => {
        if (!definition) return [];

        return trackingFields
            .filter((field) => hasDefaultValue(definition, field))
            .map((field) => trackingFieldKeyByField[field]);
    }, [definition]);

    const openTrackingFieldsModal = (): void => {
        if (!definition) return;

        setTrackingFieldsModalVisible(true);
    };

    const closeTrackingFieldsModal = (): void => {
        setTrackingFieldsModalVisible(false);
    };

    const saveTrackingFields = async (
        value: ExerciseDefinitionTrackingFields,
    ): Promise<void> => {
        if (!definition) return;

        const selectedTrackingFields = fieldsFromTrackingValue(value);
        const defaultTrackingFields = getSelectedFieldsWithValues(
            definition,
            selectedTrackingFields,
        );

        await saveData.mutateAsync({
            exerciseDefinitionId: definition.id,
            defaultTrackingFields,
            notes: definition.data?.notes,
            defaultTargetSet: targetSetFromDefinition(
                definition,
                defaultTrackingFields,
            ),
        });
        setSelectedFields(selectedTrackingFields);
        closeTrackingFieldsModal();
    };

    const openDefaultValueModal = (field: ExerciseTrackingField): void => {
        if (!definition) return;

        setEditingDefaultField(field);
    };

    const closeDefaultValueModal = (): void => {
        setEditingDefaultField(null);
    };

    const saveDefaultFieldValue = async (
        field: ExerciseTrackingField,
        value: ExerciseDefinitionTargetValue,
    ): Promise<void> => {
        if (!definition) return;

        const selectedTrackingFields = selectedFields.includes(field)
            ? selectedFields
            : [...selectedFields, field];
        const defaultTargetSet = applyValueToTargetSet(
            targetSetFromDefinition(definition, selectedTrackingFields),
            value,
        );
        const defaultTrackingFields = selectedTrackingFields.filter(
            (selectedField) => {
                if (selectedField === value.field) {
                    return hasTargetSetValue(defaultTargetSet, selectedField);
                }

                return hasDefaultValue(definition, selectedField);
            },
        );
        const nextSelectedFields = hasTargetSetValue(
            defaultTargetSet,
            value.field,
        )
            ? selectedTrackingFields
            : selectedTrackingFields.filter(
                  (selectedField) => selectedField !== value.field,
              );

        await saveData.mutateAsync({
            exerciseDefinitionId: definition.id,
            defaultTrackingFields,
            notes: definition.data?.notes,
            defaultTargetSet,
        });
        setSelectedFields(nextSelectedFields);
        closeDefaultValueModal();
    };

    return {
        defaultMetricItems,
        editingDefaultField,
        fieldsWithDefaultData,
        isSavingDefaults: saveData.isPending,
        isTrackingFieldsModalVisible,
        trackingFieldValue,
        closeDefaultValueModal,
        closeTrackingFieldsModal,
        openDefaultValueModal,
        openTrackingFieldsModal,
        saveDefaultFieldValue,
        saveTrackingFields,
    };
};
