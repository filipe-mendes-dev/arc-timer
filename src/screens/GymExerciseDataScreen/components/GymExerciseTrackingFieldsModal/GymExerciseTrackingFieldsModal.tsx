import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
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
    trackingFields: TrackingFields;
    visible: boolean;
    onClose: () => void;
    onToggleField: (field: keyof TrackingFields) => void;
}

const TrackingFieldToggle = ({
    isSelected,
    label,
    onPress,
}: TrackingFieldToggleProps) => {
    const { theme } = useTheme();
    const st = useStyles();
    const iconName = isSelected ? 'checkmark-circle' : 'ellipse-outline';
    const iconColor = isSelected
        ? theme.palette.accent.primary
        : theme.palette.text.muted;
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
    trackingFields,
    visible,
    onClose,
    onToggleField,
}: GymExerciseTrackingFieldsModalProps) => {
    const { t } = useTranslation();
    const st = useStyles();

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
                        onPress={() => onToggleField('hasReps')}
                    />

                    <TrackingFieldToggle
                        label={t('gymExerciseData.fields.weightKg')}
                        isSelected={trackingFields.hasWeight}
                        onPress={() => onToggleField('hasWeight')}
                    />

                    <TrackingFieldToggle
                        label={t('gymExerciseData.fields.durationSec')}
                        isSelected={trackingFields.hasDurationSec}
                        onPress={() => onToggleField('hasDurationSec')}
                    />

                    <TrackingFieldToggle
                        label={t('gymExerciseData.fields.distanceMeters')}
                        isSelected={trackingFields.hasDistanceMeters}
                        onPress={() => onToggleField('hasDistanceMeters')}
                    />
                </View>

                <Button
                    title={t('common.actions.done')}
                    variant="primary"
                    onPress={onClose}
                />
            </View>
        </Modal>
    );
};
