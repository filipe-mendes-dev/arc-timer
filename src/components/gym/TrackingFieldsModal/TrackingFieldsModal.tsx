import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionModal } from '@src/components/modals/ActionModal';
import {
    OptionPills,
    type OptionPillsOption,
} from '@src/screens/SettingsScreen/components/OptionPills';

import type {
    TrackingFieldKey,
    TrackingFieldsModalCopy,
    TrackingFieldsValue,
} from './TrackingFieldsModal.types';

interface TrackingFieldsModalProps<FieldValues extends TrackingFieldsValue> {
    copy: TrackingFieldsModalCopy;
    fieldsWithData: readonly (keyof FieldValues)[];
    isSaving: boolean;
    value: FieldValues | null;
    visible: boolean;
    onClose: () => void;
    onSave: (value: FieldValues) => void;
}

const getSelectedTrackingFields = (
    trackingFields: TrackingFieldsValue,
): TrackingFieldKey[] => {
    const selectedFields: TrackingFieldKey[] = [];

    if (trackingFields.hasReps) selectedFields.push('hasReps');
    if (trackingFields.hasWeight) selectedFields.push('hasWeight');
    if (trackingFields.hasDurationSec) selectedFields.push('hasDurationSec');
    if (trackingFields.hasDistanceMeters) {
        selectedFields.push('hasDistanceMeters');
    }
    if (trackingFields.hasRpe) selectedFields.push('hasRpe');

    return selectedFields;
};

const getFieldsWithDataToRemove = <FieldValues extends TrackingFieldsValue>(
    value: FieldValues,
    draftValue: FieldValues,
    fieldsWithData: readonly (keyof FieldValues)[],
): (keyof FieldValues)[] =>
    fieldsWithData.filter(
        (field) => value[field] === true && draftValue[field] === false,
    );

export const TrackingFieldsModal = <FieldValues extends TrackingFieldsValue>({
    copy,
    fieldsWithData,
    isSaving,
    value,
    visible,
    onClose,
    onSave,
}: TrackingFieldsModalProps<FieldValues>) => {
    const { t } = useTranslation();
    const [draftValue, setDraftValue] = useState<FieldValues | null>(value);
    const [dismissalKey, setDismissalKey] = useState(0);
    const fieldsWithDataToRemove =
        value && draftValue
            ? getFieldsWithDataToRemove(value, draftValue, fieldsWithData)
            : [];
    const hasFieldsWithDataToRemove = fieldsWithDataToRemove.length > 0;
    const fieldNames = fieldsWithDataToRemove
        .map((field) => t(`gymExerciseData.fieldsByKey.${String(field)}`))
        .join(', ');
    const warningMessage = t(copy.removeDataWarning, {
        fields: fieldNames,
    });
    const saveLabel = t('common.actions.save');
    const removeSaveLabel = t(copy.removeDataAndSave);
    const primaryButtonTitle = hasFieldsWithDataToRemove
        ? removeSaveLabel
        : saveLabel;

    useEffect(() => {
        if (!visible) return;

        setDraftValue(value);
        setDismissalKey((current) => current + 1);
    }, [value, visible]);

    if (!value || !draftValue) return null;

    const trackingFieldOptions: OptionPillsOption<TrackingFieldKey>[] = [
        {
            value: 'hasReps',
            label: t('gymExerciseData.fields.reps'),
        },
        {
            value: 'hasWeight',
            label: t('gymExerciseData.fields.weightKg'),
        },
        {
            value: 'hasDurationSec',
            label: t('gymExerciseData.fields.durationSec'),
        },
        {
            value: 'hasDistanceMeters',
            label: t('gymExerciseData.fields.distanceMeters'),
        },
    ];
    const selectedTrackingFields = getSelectedTrackingFields(draftValue);

    if (draftValue.hasRpe !== undefined) {
        trackingFieldOptions.push({
            value: 'hasRpe',
            label: t('gymExerciseData.fieldsByKey.hasRpe'),
        });
    }

    return (
        <ActionModal
            visible={visible}
            title={t(copy.title)}
            description={t(copy.description)}
            error={{
                message: hasFieldsWithDataToRemove ? warningMessage : '',
                isDismissible: true,
                dismissalKey,
            }}
            primaryAction={{
                title: primaryButtonTitle,
                loading: isSaving,
                onPress: () => onSave(draftValue),
            }}
            secondaryAction={{
                onPress: onClose,
            }}
            onClose={onClose}
        >
            <OptionPills
                options={trackingFieldOptions}
                selectedValues={selectedTrackingFields}
                onToggle={(field) => {
                    setDraftValue((current) => {
                        if (!current) return current;

                        return {
                            ...current,
                            [field]: !current[field],
                        };
                    });
                    setDismissalKey((prev) => prev + 1);
                }}
            />
        </ActionModal>
    );
};
