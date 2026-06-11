import { useTranslation } from 'react-i18next';

import type { ExerciseDefinitionRecentSessionItem } from '@src/core/entities/exerciseDefinition.interfaces';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';

import { RecentTrainingSessionRow } from './RecentTrainingSessionRow';

interface RecentSessionsSectionProps {
    sessions: readonly ExerciseDefinitionRecentSessionItem[];
    onPressSession: (session: ExerciseDefinitionRecentSessionItem) => void;
}

export const RecentSessionsSection = ({
    sessions,
    onPressSession,
}: RecentSessionsSectionProps) => {
    const { t } = useTranslation();

    if (sessions.length === 0) return null;

    return (
        <ScreenSection
            title={t('exerciseDefinitions.fields.recentSessions')}
            topSpacing="medium"
        >
            {sessions.map((session) => (
                <RecentTrainingSessionRow
                    key={`${session.kind}:${session.id}`}
                    session={session}
                    onPress={() => onPressSession(session)}
                />
            ))}
        </ScreenSection>
    );
};
