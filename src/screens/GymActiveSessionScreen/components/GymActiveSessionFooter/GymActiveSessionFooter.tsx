import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { FooterBar } from '@src/components/layout/FooterBar';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymActiveSessionFooter.styles';

interface GymActiveSessionFooterProps {
    onAddExercise: () => void;
    onBack: () => void;
    onEnd: () => void;
}

export const GymActiveSessionFooter = ({
    onAddExercise,
    onBack,
    onEnd,
}: GymActiveSessionFooterProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();

    return (
        <FooterBar containerStyle={st.root}>
            <View style={st.actionItem}>
                <CircleIconButton
                    onPress={onBack}
                    variant="secondary"
                    size={54}
                >
                    <Ionicons
                        name="chevron-back"
                        size={22}
                        color={theme.palette.button.text.secondary}
                    />
                </CircleIconButton>
                <AppText variant="caption" style={st.actionLabel}>
                    {t('common.actions.back')}
                </AppText>
            </View>

            <View style={st.primaryActionItem}>
                <CircleIconButton
                    onPress={onAddExercise}
                    variant="primary"
                    size={72}
                >
                    <Ionicons
                        name="add"
                        size={32}
                        color={theme.palette.text.inverted}
                    />
                </CircleIconButton>
                <AppText
                    variant="caption"
                    style={st.actionLabel}
                    numberOfLines={1}
                >
                    {t('gymActiveSession.actions.addExercise')}
                </AppText>
            </View>

            <View style={st.actionItem}>
                <CircleIconButton onPress={onEnd} variant="secondary" size={54}>
                    <Ionicons
                        name="stop"
                        size={22}
                        color={theme.palette.button.text.secondary}
                    />
                </CircleIconButton>
                <AppText variant="caption" style={st.actionLabel}>
                    {t('gymActiveSession.actions.end')}
                </AppText>
            </View>
        </FooterBar>
    );
};
