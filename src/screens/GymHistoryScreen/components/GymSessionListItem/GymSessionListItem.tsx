import { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { GymSession } from '@src/core/entities/gym.interfaces';
import { formatCompletedGymDuration } from '@src/core/gyms/formatGymDuration';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymSessionListItem.styles';

interface GymSessionListItemProps {
    onPress: () => void;
    session: GymSession;
}

const GymSessionListItem = ({
    onPress,
    session,
}: GymSessionListItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const setCount = session.exerciseRecords.reduce(
        (total, record) => total + record.sets.length,
        0,
    );
    const durationText = useMemo(
        () =>
            formatCompletedGymDuration(session.startedAtMs, session.endedAtMs),
        [session.endedAtMs, session.startedAtMs],
    );

    return (
        <MetaCard
            onPress={onPress}
            containerStyle={st.card}
            date={new Date(session.startedAtMs).toISOString()}
            summaryContent={
                <View style={st.row}>
                    <View style={st.left}>
                        <AppText
                            variant="subtitle"
                            style={st.title}
                            numberOfLines={2}
                        >
                            {t('gymHistory.sessionTitle')}
                        </AppText>

                        <AppText
                            variant="bodySmall"
                            tone="secondary"
                            numberOfLines={1}
                        >
                            {t('common.units.exercise', {
                                count: session.exerciseRecords.length,
                            })}
                            {' · '}
                            {t('common.units.set', { count: setCount })}
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

export default GymSessionListItem;
