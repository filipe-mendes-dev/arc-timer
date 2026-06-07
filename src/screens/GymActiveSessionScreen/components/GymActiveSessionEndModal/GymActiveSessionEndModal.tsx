import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';

import { useStyles } from './GymActiveSessionEndModal.styles';

interface GymActiveSessionEndModalProps {
    isDiscardingSession: boolean;
    isFinishingSession: boolean;
    visible: boolean;
    onCancel: () => void;
    onComplete: () => void;
    onDiscard: () => void;
}

export const GymActiveSessionEndModal = ({
    isDiscardingSession,
    isFinishingSession,
    visible,
    onCancel,
    onComplete,
    onDiscard,
}: GymActiveSessionEndModalProps) => {
    const { t } = useTranslation();
    const st = useStyles();
    const isActionPending = isFinishingSession || isDiscardingSession;

    return (
        <Modal
            visible={visible}
            onRequestClose={onCancel}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.modalBody}>
                <View style={st.modalTextContainer}>
                    <AppText variant="title3" style={st.modalTitle}>
                        {t('gym.finishSessionModal.title')}
                    </AppText>

                    <AppText
                        variant="bodySmall"
                        tone="secondary"
                        style={st.modalMessage}
                    >
                        {t('gym.finishSessionModal.message')}
                    </AppText>
                </View>

                <View style={st.modalActions}>
                    <Button
                        title={t('gym.finishSessionModal.complete')}
                        variant="primary"
                        loading={isFinishingSession}
                        disabled={isDiscardingSession}
                        onPress={onComplete}
                    />

                    <Button
                        title={t('gym.finishSessionModal.discard')}
                        variant="danger"
                        loading={isDiscardingSession}
                        disabled={isFinishingSession}
                        onPress={onDiscard}
                    />

                    <Button
                        title={t('common.actions.cancel')}
                        variant="ghost"
                        disabled={isActionPending}
                        onPress={onCancel}
                        style={st.cancelButton}
                    />
                </View>
            </View>
        </Modal>
    );
};
