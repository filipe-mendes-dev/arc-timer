import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import type { ButtonProps } from '@src/components/ui/Button/Button.interfaces';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppText } from '@src/components/ui/Typography/AppText';

import { useActionModalStyles } from './ActionModal.styles';

export interface ActionModalButtonConfig {
    disabled?: boolean;
    loading?: boolean;
    title?: string;
    variant?: ButtonProps['variant'];
    onPress: () => void;
}

export interface ActionModalErrorConfig {
    dismissalKey?: string | number;
    isDismissible?: boolean;
    message: string;
    onClose?: () => void;
}

export interface ActionModalProps {
    children?: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    description?: string;
    error?: ActionModalErrorConfig;
    primaryAction?: ActionModalButtonConfig;
    secondaryAction?: ActionModalButtonConfig;
    style?: StyleProp<ViewStyle>;
    title?: string;
    visible: boolean;
    onClose: () => void;
}

export const ActionModal = ({
    children,
    containerStyle,
    description,
    error,
    primaryAction,
    secondaryAction,
    style,
    title,
    visible,
    onClose,
}: ActionModalProps) => {
    const { t } = useTranslation();
    const st = useActionModalStyles();
    const hasText = !!title || !!description;
    const errorMessage = error?.message.trim() ?? '';
    const hasActions = !!error || !!primaryAction || !!secondaryAction;

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            containerStyle={[st.container, containerStyle]}
            contentStyle={[st.content, style]}
        >
            {hasText && (
                <View style={st.text}>
                    {!!title && <AppText variant="title3">{title}</AppText>}

                    {!!description && (
                        <AppText variant="bodySmall" tone="secondary">
                            {description}
                        </AppText>
                    )}
                </View>
            )}

            {children}

            {hasActions && (
                <View>
                    {error && (
                        <ErrorBanner
                            message={errorMessage}
                            isDismissible={error.isDismissible}
                            dismissalKey={error.dismissalKey}
                            onClose={error.onClose}
                            collapseContentStyle={st.errorCollapse}
                        />
                    )}
                    <View style={st.actions}>
                        {!!primaryAction && (
                            <Button
                                title={
                                    primaryAction.title ??
                                    t('common.actions.save')
                                }
                                variant={primaryAction.variant ?? 'primary'}
                                loading={primaryAction.loading}
                                disabled={primaryAction.disabled}
                                onPress={primaryAction.onPress}
                            />
                        )}

                        {!!secondaryAction && (
                            <Button
                                title={
                                    secondaryAction.title ??
                                    t('common.actions.cancel')
                                }
                                variant={secondaryAction.variant ?? 'ghost'}
                                loading={secondaryAction.loading}
                                disabled={secondaryAction.disabled}
                                onPress={secondaryAction.onPress}
                                style={st.secondaryButton}
                            />
                        )}
                    </View>
                </View>
            )}
        </Modal>
    );
};
