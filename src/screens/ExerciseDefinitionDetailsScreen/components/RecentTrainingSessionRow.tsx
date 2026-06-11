import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ExerciseDefinitionRecentSessionItem } from '@src/core/entities/exerciseDefinition.interfaces';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppIcon, type IconId } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

interface RecentTrainingSessionRowProps {
    onPress: () => void;
    session: ExerciseDefinitionRecentSessionItem;
}

export const RecentTrainingSessionRow = ({
    onPress,
    session,
}: RecentTrainingSessionRowProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseDefinitionDetailsScreenStyles();
    let title = session.title;
    if (title.length === 0 && session.sourceGymPlanName != null) {
        title = session.sourceGymPlanName;
    }
    if (title.length === 0 && session.kind === 'gym') {
        title = t('gymHistory.sessionTitle');
    }
    let kindIconId: IconId = 'workout';
    if (session.kind === 'gym') {
        kindIconId = 'gymSession';
    }

    return (
        <GuardedPressable onPress={onPress} style={st.sessionRow}>
            <View style={st.sessionInfo}>
                <AppText
                    variant="bodySmall"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={st.sessionTitle}
                >
                    {title}
                </AppText>
            </View>

            <View style={st.sessionDurationPill}>
                <AppIcon
                    id={kindIconId}
                    size={14}
                    color={theme.palette.metaCard.datePill.icon}
                />
                <AppText
                    variant="caption"
                    tone="secondary"
                    style={st.sessionDurationText}
                    numberOfLines={1}
                >
                    {t(`history.kind.${session.kind}`)}
                </AppText>
            </View>
        </GuardedPressable>
    );
};
