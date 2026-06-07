import { useTranslation } from 'react-i18next';

import type { GymSessionListItem } from '@src/core/entities/gymSession.interfaces';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';

import { RecentGymSessionRow } from './RecentGymSessionRow';

interface RecentSessionsSectionProps {
    sessions: readonly GymSessionListItem[];
    onPressSession: (sessionId: string) => void;
}

export const RecentSessionsSection = ({
    sessions,
    onPressSession,
}: RecentSessionsSectionProps) => {
    const { t } = useTranslation();

    return (
        <ScreenSection
            title={t('exerciseDefinitions.fields.recentSessions')}
            topSpacing="medium"
        >
            {sessions.length === 0 && (
                <ListEmptyState
                    title={t('exerciseDefinitions.emptyRecentSessionsTitle')}
                    description={t(
                        'exerciseDefinitions.emptyRecentSessionsDescription',
                    )}
                />
            )}

            {sessions.map((session) => (
                <RecentGymSessionRow
                    key={session.id}
                    session={session}
                    onPress={() => onPressSession(session.id)}
                />
            ))}
        </ScreenSection>
    );
};
