import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import type { TrackingFields } from '../../GymExerciseDataScreen.types';
import { useStyles } from './GymExerciseTrackingFieldsModal.styles';

interface TrackingFieldToggleProps {
    isSelected: boolean;
    label: string;
    onPress: () => void;
}

interface GymExerciseTrackingFieldsModalProps {
    fieldsWithDataToRemove: readonly (keyof TrackingFields)[];
    isSaving: boolean;
    trackingFields: TrackingFields | null;
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    onToggleField: (field: keyof TrackingFields) => void;
}

const TrackingFieldToggle = ({
    isSelected,
    label,
    onPress,
}: TrackingFieldToggleProps) => {
    const { theme } = useTheme();
    const st = useStyles();
    const accentColor = theme.palette.accent.primary;
    const mutedColor = theme.palette.text.muted;
    const iconName = isSelected ? 'checkmark-circle' : 'ellipse-outline';
    const iconColor = isSelected ? accentColor : mutedColor;
    const tone = isSelected ? 'primary' : 'muted';

    return (
        <GuardedPressable
            onPress={onPress}
            style={[st.fieldToggle, isSelected && st.fieldToggleSelected]}
        >
            <Ionicons name={iconName} size={18} color={iconColor} />

            <AppText variant="bodySmall" tone={tone}>
                {label}
            </AppText>
        </GuardedPressable>
    );
};

export const GymExerciseTrackingFieldsModal = ({
    fieldsWithDataToRemove,
    isSaving,
    trackingFields,
    visible,
    onClose,
    onSave,
    onToggleField,
}: GymExerciseTrackingFieldsModalProps) => {
    const { t } = useTranslation();
    const st = useStyles();
    const [dismissalKey, setDismissalKey] = useState(0);
    const hasFieldsWithDataToRemove = fieldsWithDataToRemove.length > 0;
    const fieldNames = fieldsWithDataToRemove
        .map((field) => t(`gymExerciseData.fieldsByKey.${field}`))
        .join(', ');
    const warningMessage = t('gymExerciseData.defaults.removeDataWarning', {
        fields: fieldNames,
    });
    const saveLabel = t('common.actions.save');
    const removeSaveLabel = t('gymExerciseData.defaults.removeDataAndSave');
    const primaryButtonTitle = hasFieldsWithDataToRemove ? removeSaveLabel : saveLabel;

    if (!trackingFields) return null;

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.modalBody}>
                <View style={st.modalText}>
                    <AppText variant="title3">
                        {t('gymExerciseData.defaults.title')}
                    </AppText>

                    <AppText variant="bodySmall" tone="secondary">
                        {t('gymExerciseData.defaults.description')}
                    </AppText>
                </View>

                <View style={st.fieldToggleGrid}>
                    <TrackingFieldToggle
                        label={t('gymExerciseData.fields.reps')}
                        isSelected={trackingFields.hasReps}
                        onPress={() => {
                            onToggleField('hasReps');
                            setDismissalKey((prev) => prev + 1);
                        }}
                    />

                    <TrackingFieldToggle
                        label={t('gymExerciseData.fields.weightKg')}
                        isSelected={trackingFields.hasWeight}
                        onPress={() => {
                            onToggleField('hasWeight');
                            setDismissalKey((prev) => prev + 1);
                        }}
                    />

                    <TrackingFieldToggle
                        label={t('gymExerciseData.fields.durationSec')}
                        isSelected={trackingFields.hasDurationSec}
                        onPress={() => {
                            onToggleField('hasDurationSec');
                            setDismissalKey((prev) => prev + 1);
                        }}
                    />

                    <TrackingFieldToggle
                        label={t('gymExerciseData.fields.distanceMeters')}
                        isSelected={trackingFields.hasDistanceMeters}
                        onPress={() => {
                            onToggleField('hasDistanceMeters');
                            setDismissalKey((prev) => prev + 1);
                        }}
                    />
                </View>

                <View style={st.modalActions}>
                    <ErrorBanner
                        message={hasFieldsWithDataToRemove ? warningMessage : ''}
                        isDismissible
                        dismissalKey={dismissalKey}
                    />
                    <Button
                        title={t('common.actions.cancel')}
                        variant="secondary"
                        onPress={onClose}
                    />

                    <Button
                        title={primaryButtonTitle}
                        variant="primary"
                        loading={isSaving}
                        onPress={onSave}
                    />
                </View>
            </View>
        </Modal>
    );
};
