import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExerciseWeightReference } from '@src/components/gym/ExerciseWeightReference/ExerciseWeightReference';
import { ScreenHeaderBar } from '@src/components/layout/ScreenHeaderBar';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import type { ExerciseDefinitionSetMetric } from '@src/core/entities/exerciseDefinition.interfaces';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymExerciseDataHeader.styles';

interface GymExerciseDataHeaderProps {
    completedSetCount: number;
    elapsedDuration: string;
    exerciseName: string;
    isSelectMode: boolean;
    selectedCount: number;
    setCount: number;
    weightPr?: ExerciseDefinitionSetMetric;
    lastWeightSet?: ExerciseDefinitionSetMetric | null;
    onPressExercise: () => void;
}

export const GymExerciseDataHeader = ({
    completedSetCount,
    elapsedDuration,
    exerciseName,
    isSelectMode,
    selectedCount,
    setCount,
    weightPr,
    lastWeightSet,
    onPressExercise,
}: GymExerciseDataHeaderProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const isComplete = setCount > 0 && completedSetCount === setCount;
    const selectedTitle = t('common.selectMode.countSelected', {
        count: selectedCount,
    });
    const statusIconId = isComplete ? 'checkmarkCircle' : 'radioButtonOff';
    const statusTextKey = isComplete
        ? 'gymExerciseData.status.complete'
        : 'gymExerciseData.status.inProgress';
    const title = isSelectMode ? selectedTitle : exerciseName;
    const titleIconId = isSelectMode ? 'checkmark' : 'exercise';
    const hasWeightHistory = lastWeightSet != null || weightPr !== undefined;

    return (
        <ScreenHeaderBar containerStyle={st.root}>
            <View style={st.headerTopRow}>
                <View style={st.titleBlock}>
                    <GuardedPressable
                        style={st.titleRow}
                        onPress={onPressExercise}
                        disabled={isSelectMode}
                        accessibilityRole="button"
                        accessibilityLabel={t(
                            'gymExerciseData.actions.openExerciseDetails',
                            {
                                name: exerciseName,
                            },
                        )}
                    >
                        <AppIcon
                            id={titleIconId}
                            size={24}
                            color={theme.palette.text.primary}
                        />
                        <AppText
                            variant="title1"
                            style={st.headerTitle}
                            numberOfLines={2}
                        >
                            {title}
                        </AppText>
                    </GuardedPressable>

                    {isSelectMode && (
                        <AppText
                            variant="bodySmall"
                            tone="muted"
                            numberOfLines={1}
                        >
                            {exerciseName}
                        </AppText>
                    )}
                </View>

                {!isSelectMode && (
                    <GuardedPressable
                        style={st.detailsLink}
                        onPress={onPressExercise}
                        accessibilityRole="button"
                        accessibilityLabel={t(
                            'gymExerciseData.actions.openExerciseDetails',
                            {
                                name: exerciseName,
                            },
                        )}
                    >
                        <AppText variant="caption" style={st.detailsLabel}>
                            {t('common.actions.details')}
                        </AppText>
                        <AppIcon
                            id="linkArrow"
                            size={14}
                            color={theme.palette.accent.primaryStrong}
                        />
                    </GuardedPressable>
                )}
            </View>

            <View style={st.metadataRow}>
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
                <View style={st.durationContainer}>
                    <AppIcon
                        id="duration"
                        size={15}
                        color={theme.palette.text.primary}
                        style={st.durationIcon}
                    />
                    <AppText
                        variant="body"
                        style={st.durationText}
                        numberOfLines={1}
                    >
                        {elapsedDuration}
                    </AppText>
                </View>
            </View>

            {!isSelectMode && hasWeightHistory && (
                <View style={st.historyRow}>
                    {lastWeightSet && (
                        <ExerciseWeightReference
                            metric={lastWeightSet}
                            variant="lastSession"
                        />
                    )}
                    {lastWeightSet && weightPr && (
                        <View style={st.historyDivider} />
                    )}
                    {weightPr && (
                        <ExerciseWeightReference
                            metric={weightPr}
                            variant="weightPr"
                        />
                    )}
                </View>
            )}
        </ScreenHeaderBar>
    );
};
