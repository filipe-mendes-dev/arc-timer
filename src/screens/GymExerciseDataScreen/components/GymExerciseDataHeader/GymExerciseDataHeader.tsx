import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ScreenHeaderBar } from '@src/components/layout/ScreenHeaderBar';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymExerciseDataHeader.styles';

interface GymExerciseDataHeaderProps {
    completedSetCount: number;
    elapsedDuration: string;
    exerciseName: string;
    isSelectMode: boolean;
    selectedCount: number;
    setCount: number;
}

export const GymExerciseDataHeader = ({
    completedSetCount,
    elapsedDuration,
    exerciseName,
    isSelectMode,
    selectedCount,
    setCount,
}: GymExerciseDataHeaderProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const isComplete = setCount > 0 && completedSetCount === setCount;
    const selectedTitle = t('common.selectMode.countSelected', {
        count: selectedCount,
    });
    const statusIconId = isComplete ? 'checkmarkCircle' : 'radioButtonOff';
    const statusTextKey = isComplete ? 'gymExerciseData.status.complete' : 'gymExerciseData.status.inProgress';
    const title = isSelectMode ? selectedTitle : exerciseName;
    const subtitle = isSelectMode ? exerciseName : t('gymExerciseData.exerciseSets');
    const titleIconId = isSelectMode ? 'checkmark' : 'exercise';

    return (
        <ScreenHeaderBar containerStyle={st.root}>
            <View style={st.headerTopRow}>
                <View style={st.titleBlock}>
                    <View style={st.titleRow}>
                        <AppIcon
                            id={titleIconId}
                            size={22}
                            color={theme.palette.text.primary}
                        />
                        <AppText
                            variant="title1"
                            style={st.headerTitle}
                            numberOfLines={1}
                        >
                            {title}
                        </AppText>
                    </View>

                    <AppText variant="bodySmall" tone="muted" numberOfLines={1}>
                        {subtitle}
                    </AppText>
                </View>

                <View style={st.durationContainer}>
                    <AppIcon
                        id="duration"
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
                    <AppIcon
                        id="sets"
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

                <View style={st.metricDivider} />

                <View style={st.metricItem}>
                    <AppIcon
                        id={statusIconId}
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
                        {t(statusTextKey)}
                    </AppText>
                </View>
            </View>
        </ScreenHeaderBar>
    );
};
