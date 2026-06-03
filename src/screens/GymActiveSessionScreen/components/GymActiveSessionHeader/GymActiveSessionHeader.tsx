import { View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeaderBar } from '@src/components/layout/ScreenHeaderBar';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymActiveSessionHeader.styles';

interface GymActiveSessionHeaderProps {
    elapsedDuration: string;
    exerciseRecordCount: number;
    setCount: number;
    startedAtLabel: string;
}

export const GymActiveSessionHeader = ({
    elapsedDuration,
    exerciseRecordCount,
    setCount,
    startedAtLabel,
}: GymActiveSessionHeaderProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();

    return (
        <ScreenHeaderBar containerStyle={st.root}>
            <View style={st.headerTopRow}>
                <View style={st.titleBlock}>
                    <View style={st.titleRow}>
                        <Ionicons
                            name="barbell-outline"
                            size={16}
                            color={theme.palette.text.primary}
                        />
                        <AppText
                            variant="title1"
                            style={st.headerTitle}
                            numberOfLines={1}
                        >
                            {t('gymActiveSession.title')}
                        </AppText>
                    </View>

                    <AppText variant="bodySmall" tone="muted" numberOfLines={1}>
                        {t('gymActiveSession.startedAt')} {startedAtLabel}
                    </AppText>
                </View>

                <View style={st.durationContainer}>
                    <Ionicons
                        name="timer-outline"
                        size={16}
                        color={theme.palette.text.primary}
                        style={st.durationIcon}
                    />
                    <AppText
                        variant="title3"
                        style={st.durationText}
                        numberOfLines={1}
                    >
                        {elapsedDuration}
                    </AppText>
                </View>
            </View>

            <View style={st.metricsRow}>
                <View style={st.metricItem}>
                    <Feather
                        name="activity"
                        size={14}
                        color={theme.palette.text.muted}
                        style={st.metricIcon}
                    />
                    <AppText
                        variant="caption"
                        tone="muted"
                        style={st.metricLabel}
                        numberOfLines={1}
                    >
                        {t('common.units.exercise', {
                            count: exerciseRecordCount,
                        })}
                    </AppText>
                </View>

                <View style={st.metricDivider} />

                <View style={st.metricItem}>
                    <Feather
                        name="repeat"
                        size={14}
                        color={theme.palette.text.muted}
                        style={st.metricIcon}
                    />
                    <AppText
                        variant="caption"
                        tone="muted"
                        style={st.metricLabel}
                        numberOfLines={1}
                    >
                        {t('common.units.set', { count: setCount })}
                    </AppText>
                </View>
            </View>
        </ScreenHeaderBar>
    );
};
