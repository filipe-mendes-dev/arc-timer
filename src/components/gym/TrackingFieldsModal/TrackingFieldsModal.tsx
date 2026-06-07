import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppText } from '@src/components/ui/Typography/AppText';
import {
    OptionPills,
    type OptionPillsOption,
} from '@src/screens/SettingsScreen/components/OptionPills';

import type {
    TrackingFieldKey,
    TrackingFieldsModalCopy,
    TrackingFieldsValue,
} from './TrackingFieldsModal.types';
import { useStyles } from './TrackingFieldsModal.styles';

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
    const st = useStyles();
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
        <Modal
            visible={visible}
            onRequestClose={onClose}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.modalText}>
                <AppText variant="title3">{t(copy.title)}</AppText>

                <AppText variant="bodySmall" tone="secondary">
                    {t(copy.description)}
                </AppText>
            </View>

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

            <View style={st.modalActions}>
                <View>
                    <ErrorBanner
                        message={
                            hasFieldsWithDataToRemove ? warningMessage : ''
                        }
                        isDismissible
                        dismissalKey={dismissalKey}
                        collapseContentStyle={st.errorbanner}
                    />
                    <Button
                        title={primaryButtonTitle}
                        variant="primary"
                        loading={isSaving}
                        onPress={() => onSave(draftValue)}
                    />
                </View>
                <Button
                    title={t('common.actions.cancel')}
                    variant="ghost"
                    onPress={onClose}
                    style={st.cancelButton}
                />
            </View>
        </Modal>
    );
};
