import type { ReactNode } from 'react';
import { useRef } from 'react';
import { View } from 'react-native';

import { Modal } from '../Modal';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useConfirmDialogStyles } from './ConfirmDialog.styles';

interface ConfirmDialogContent {
    cancelLabel: string;
    confirmLabel: string;
    destructive: boolean;
    message?: ReactNode;
    title: string;
}

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    visible,
    title,
    message,
    confirmLabel = 'Remove',
    cancelLabel = 'Cancel',
    destructive = true,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    const st = useConfirmDialogStyles();
    const contentRef = useRef<ConfirmDialogContent | null>(null);

    if (visible) {
        contentRef.current = {
            cancelLabel,
            confirmLabel,
            destructive,
            message,
            title,
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
            <View style={st.container}>
                <View style={st.textContainer}>
                    <AppText variant="title3" style={st.title}>
                        {content.title}
                    </AppText>

                    {content.message ? (
                        <AppText
                            variant="bodySmall"
                            tone="secondary"
                            style={st.message}
                        >
                            {content.message}
                        </AppText>
                    ) : null}
                </View>

                <View style={st.row}>
                    <Button
                        title={content.cancelLabel}
                        variant="secondary"
                        onPress={onCancel}
                        style={st.button}
                    />

                    <Button
                        title={content.confirmLabel}
                        variant={content.destructive ? 'danger' : 'primary'}
                        onPress={onConfirm}
                        style={st.button}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmDialog;
