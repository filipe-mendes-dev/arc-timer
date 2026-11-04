import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useTrainingSessionListItems } from '@src/data/trainingSessions';
import type { TrainingSessionListParams } from '@src/core/entities/trainingSession.interfaces';
import { TrainingSessionListItem } from '@src/screens/HistoryScreen/components/TrainingSessionListItem';
import { useTheme } from '@src/theme/ThemeProvider';
import { useRecentSessionsSectionStyles } from './RecentSessionsSection.styles';
interface RecentSessionsSectionProps {
    filters: TrainingSessionListParams;
}
export const RecentSessionsSection = ({ filters }: RecentSessionsSectionProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useRecentSessionsSectionStyles();
    const router = useRouter();
    const { data: sessions = [] } = useTrainingSessionListItems({
        ...filters,
        limit: 4,
    });
    if (sessions.length === 0) return null;
    return (
        <ScreenSection
            title={t('home.recentSessions')}
            topSpacing="medium"
            rightAccessory={
                sessions.length > 3 && (
                    <GuardedPressable
                        accessibilityRole="button"
                        style={st.seeAll}
                        hitSlop={8}
                        onPress={() =>
                            router.push({
                                pathname: '/statistics/sessions',
                                params: {
                                    exerciseDefinitionId:
                                        filters.exerciseDefinitionId,
                                    kind: filters.kind,
                                    startedAtMs: filters.startedAtMs?.toString(),
                                    endedBeforeMs: filters.endedBeforeMs?.toString(),
                                },
                            })
                        }
                    >
                        <AppText variant="bodySmall" tone="secondary">
                            {t('home.actions.seeAllSessions')}
                        </AppText>
                        <AppIcon
                            id="forwardCircle"
                            color={theme.palette.text.secondary}
                        />
                    </GuardedPressable>
                )
            }
        >
            {sessions.slice(0, 3).map((session) => (
                <TrainingSessionListItem
                    key={`${session.kind}:${session.id}`}
                    session={session}
                    onPress={() =>
                        router.push(
                            session.kind === 'gym' ? `/gymHistory/${session.id}` : `/history/${session.id}`,
                        )
                    }
                />
            ))}
        </ScreenSection>
    );
};
