import { useState } from 'react';
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
    fieldsWithDataToRemove: readonly (keyof FieldValues)[];
    isSaving: boolean;
    trackingFields: FieldValues | null;
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    onToggleField: (field: keyof FieldValues) => void;
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

    return selectedFields;
};

export const TrackingFieldsModal = <FieldValues extends TrackingFieldsValue>({
    copy,
    fieldsWithDataToRemove,
    isSaving,
    trackingFields,
    visible,
    onClose,
    onSave,
    onToggleField,
}: TrackingFieldsModalProps<FieldValues>) => {
    const { t } = useTranslation();
    const st = useStyles();
    const [dismissalKey, setDismissalKey] = useState(0);
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

    if (!trackingFields) return null;

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
    const selectedTrackingFields = getSelectedTrackingFields(trackingFields);

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
                onToggle={(value) => {
                    onToggleField(value as keyof FieldValues);
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
                        onPress={onSave}
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
