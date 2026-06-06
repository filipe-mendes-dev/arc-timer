import { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { GymSessionListItem as GymSessionListItemEntity } from '@src/core/entities/gymSession.interfaces';
import { formatCompletedGymDuration } from '@src/core/gyms/formatGymDuration';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymSessionListItem.styles';

interface GymSessionListItemProps {
    isSelected?: boolean;
    isSelectMode?: boolean;
    onPress: () => void;
    onSelect?: () => void;
    session: GymSessionListItemEntity;
}

export const GymSessionListItem = ({
    isSelected = false,
    isSelectMode = false,
    onPress,
    onSelect,
    session,
}: GymSessionListItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const title = session.sourceGymPlanName ?? t('gymHistory.sessionTitle');
    const durationText = useMemo(
        () =>
            formatCompletedGymDuration(session.startedAtMs, session.endedAtMs),
        [session.endedAtMs, session.startedAtMs],
    );

    return (
        <MetaCard
            onPress={isSelectMode ? onSelect : onPress}
            containerStyle={st.card}
            showSelectionOutline={isSelected}
            isPressedFeedbackDisabled={isSelectMode}
            date={new Date(session.startedAtMs).toISOString()}
            summaryContent={
                <View style={st.row}>
                    <View style={st.left}>
                        <AppText
                            variant="subtitle"
                            style={st.title}
                            numberOfLines={2}
                        >
                            {title}
                        </AppText>

                        <AppText
                            variant="bodySmall"
                            tone="secondary"
                            numberOfLines={1}
                        >
                            {t('common.units.exercise', {
                                count: session.exerciseRecordCount,
                            })}
                            {' · '}
                            {t('common.units.set', { count: session.setCount })}
                        </AppText>
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
