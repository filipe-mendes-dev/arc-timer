import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { GymSessionListItem } from '@src/core/entities/gymSession.interfaces';
import { formatCompletedGymDuration } from '@src/core/gyms/formatGymDuration';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import {
    formatSessionDate,
    getSessionTitle,
} from '../ExerciseDefinitionDetailsScreen.helpers';
import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

interface RecentGymSessionRowProps {
    onPress: () => void;
    session: GymSessionListItem;
}

export const RecentGymSessionRow = ({
    onPress,
    session,
}: RecentGymSessionRowProps) => {
    const { i18n, t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseDefinitionDetailsScreenStyles();
    const title = getSessionTitle(session, t('gymHistory.sessionTitle'));
    const durationText = formatCompletedGymDuration(
        session.startedAtMs,
        session.endedAtMs,
    );
    const dateText = formatSessionDate(session.startedAtMs, i18n.language);

    return (
        <GuardedPressable onPress={onPress} style={st.sessionRow}>
            <View style={st.sessionInfo}>
                <AppText variant="bodySmall" style={st.sessionTitle}>
                    {title}
                </AppText>
                <AppText variant="caption" tone="secondary" numberOfLines={1}>
                    {dateText}
                    {' · '}
                    {t('common.units.exercise', {
                        count: session.exerciseRecordCount,
                    })}
                    {' · '}
                    {t('common.units.set', { count: session.setCount })}
                </AppText>
            </View>

            <View style={st.sessionDurationPill}>
                <Ionicons
                    name="time-outline"
                    size={14}
                    color={theme.palette.metaCard.datePill.icon}
                />
                <AppText
                    variant="caption"
                    tone="secondary"
                    style={st.sessionDurationText}
                    numberOfLines={1}
                >
                    {durationText}
                </AppText>
            </View>
        </GuardedPressable>
    );
};
