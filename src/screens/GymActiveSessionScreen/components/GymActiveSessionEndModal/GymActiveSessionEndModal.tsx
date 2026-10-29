import { useRef } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';

import { useStyles } from './GymActiveSessionEndModal.styles';

interface GymActiveSessionEndModalProps {
    hasCompletedSet: boolean;
    isDiscardingSession: boolean;
    isFinishingSession: boolean;
    visible: boolean;
    onCancel: () => void;
    onComplete: () => void;
    onDiscard: () => void;
}

interface GymActiveSessionEndModalContent {
    cancelLabel: string;
    completeLabel: string;
    discardLabel: string;
    hasCompletedSet: boolean;
    message: string;
    title: string;
}

export const GymActiveSessionEndModal = ({
    hasCompletedSet,
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
    let message = t('gym.finishSessionModal.message');
    if (!hasCompletedSet) {
        message = t('gym.finishSessionModal.discardOnlyMessage');
    }
    const contentRef = useRef<GymActiveSessionEndModalContent | null>(null);

    if (visible) {
        contentRef.current = {
            cancelLabel: t('common.actions.cancel'),
            completeLabel: t('gym.finishSessionModal.complete'),
            discardLabel: t('gym.finishSessionModal.discard'),
            hasCompletedSet,
            message,
            title: t('gym.finishSessionModal.title'),
        };
    }

    const content = contentRef.current;

    if (!content) {
        return null;
    }

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
                        {content.title}
                    </AppText>

                    <AppText
                        variant="bodySmall"
                        tone="secondary"
                        style={st.modalMessage}
                    >
                        {content.message}
                    </AppText>
                </View>

                <View style={st.modalActions}>
                    {content.hasCompletedSet && (
                        <Button
                            title={content.completeLabel}
                            variant="primary"
                            loading={isFinishingSession}
                            disabled={isDiscardingSession}
                            onPress={onComplete}
                        />
                    )}

                    {!content.hasCompletedSet && (
                        <Button
                            title={content.discardLabel}
                            variant="danger"
                            loading={isDiscardingSession}
                            disabled={isFinishingSession}
                            onPress={onDiscard}
                        />
                    )}

                    <Button
                        title={content.cancelLabel}
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
