import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppIcon, type IconId } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { TrainingSessionListItem as TrainingSessionListItemEntity } from '@src/core/entities/trainingSession.interfaces';
import { formatCompletedGymDuration } from '@src/core/gyms/formatGymDuration';
import { formatWorkoutDuration } from '@src/core/workouts/summarizeWorkout';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './TrainingSessionListItem.styles';

interface TrainingSessionListItemProps {
    isSelected?: boolean;
    isSelectMode?: boolean;
    onPress: () => void;
    onSelect?: () => void;
    session: TrainingSessionListItemEntity;
}

const parseMetricCount = (value: string): number => {
    const count = Number(value);
    if (!Number.isFinite(count)) return 0;

    return count;
};

export const TrainingSessionListItem = ({
    isSelected = false,
    isSelectMode = false,
    onPress,
    onSelect,
    session,
}: TrainingSessionListItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();

    const kindLabel = t(`history.kind.${session.kind}`);
    let kindIconId: IconId = 'workout';
    let kindBackgroundColor = theme.palette.accent.primary;
    let kindContentColor = theme.palette.text.inverted;
    if (session.kind === 'gym') {
        kindIconId = 'exercise';
        kindBackgroundColor = theme.palette.accent.soft;
        kindContentColor = theme.palette.accent.primaryStrong;
    }

    let durationText = formatWorkoutDuration(session.durationSec ?? 0);
    if (session.kind === 'gym') {
        durationText = formatCompletedGymDuration(
            session.startedAtMs,
            session.endedAtMs,
        );
    }

    let title = session.title;
    if (title.length === 0 && session.kind === 'gym') {
        title = t('gymHistory.sessionTitle');
    }

    const primaryMetricCount = parseMetricCount(session.primaryMetric);
    const secondaryMetricCount = parseMetricCount(
        session.secondaryMetric ?? '',
    );
    let metricText = t('common.units.set', { count: primaryMetricCount });
    if (session.kind === 'gym') {
        metricText = t('common.units.exercise', { count: primaryMetricCount });
    }

    if (session.secondaryMetric != null) {
        let secondaryMetricText = t('common.units.exercise', {
            count: secondaryMetricCount,
        });
        if (session.kind === 'gym') {
            secondaryMetricText = t('common.units.set', {
                count: secondaryMetricCount,
            });
        }
        metricText = `${metricText} · ${secondaryMetricText}`;
    }
    let selectionIcon: ReactNode = null;
    let selectionIconColor = theme.palette.text.secondary;
    if (isSelected) {
        selectionIconColor = theme.palette.accent.primary;
    }

    if (isSelectMode) {
        selectionIcon = (
            <AppIcon
                id={isSelected ? 'checkmarkCircle' : 'radioButtonOff'}
                size={22}
                color={selectionIconColor}
            />
        );
    }

    return (
        <MetaCard
            onPress={isSelectMode ? onSelect : onPress}
            containerStyle={st.card}
            showSelectionOutline={isSelected}
            isPressedFeedbackDisabled={isSelectMode}
            date={new Date(session.startedAtMs).toISOString()}
            statusBadge={{
                label: kindLabel,
                icon: (
                    <AppIcon
                        id={kindIconId}
                        size={14}
                        color={kindContentColor}
                    />
                ),
                backgroundColor: kindBackgroundColor,
                color: kindContentColor,
            }}
            summaryContent={
                <View style={st.row}>
                    <View style={st.left}>
                        <View style={st.titleRow}>
                            {selectionIcon}
                            <View style={st.titleTextBlock}>
                                <AppText
                                    variant="subtitle"
                                    style={st.title}
                                    numberOfLines={2}
                                >
                                    {title}
                                </AppText>

                                <View style={st.metaRow}>
                                    <AppText
                                        variant="bodySmall"
                                        tone="secondary"
                                        numberOfLines={1}
                                    >
                                        {metricText}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={st.durationPill}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={theme.palette.metaCard.datePill.icon}
                        />
                        <AppText
                            variant="bodySmall"
                            tone="secondary"
                            style={st.durationText}
                            numberOfLines={1}
                        >
                            {durationText}
                        </AppText>
                    </View>
                </View>
            }
        />
    );
};
