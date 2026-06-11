import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionModal } from '@src/components/modals/ActionModal';
import { exerciseTrackingFieldDefinitions } from '@src/core/entities/exerciseTrackingFields';
import {
    OptionPills,
    type OptionPillsOption,
} from '@src/screens/SettingsScreen/components/OptionPills';

import type {
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
        .map((field) => {
            const matchingField = exerciseTrackingFieldDefinitions.find(
                (definition) => definition.key === field,
            );

            return matchingField ? t(matchingField.labelKey) : '';
        })
        .filter((fieldName) => fieldName.length > 0)
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

    const trackingFieldOptions: OptionPillsOption<
        Extract<keyof FieldValues, string>
    >[] = exerciseTrackingFieldDefinitions.map((field) => ({
        value: field.key as Extract<keyof FieldValues, string>,
        label: t(field.labelKey),
    }));
    const selectedTrackingFields = exerciseTrackingFieldDefinitions
        .filter((field) => draftValue[field.key] === true)
        .map((field) => field.key as Extract<keyof FieldValues, string>);

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
