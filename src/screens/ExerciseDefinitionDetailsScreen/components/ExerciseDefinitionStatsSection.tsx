import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { MetricCard } from '@src/components/ui/MetricCard';

import type { ExerciseDefinitionStatItem } from '../ExerciseDefinitionDetailsScreen.helpers';
import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

interface ExerciseDefinitionStatsSectionProps {
    items: readonly ExerciseDefinitionStatItem[];
}

export const ExerciseDefinitionStatsSection = ({
    items,
}: ExerciseDefinitionStatsSectionProps) => {
    const { t } = useTranslation();
    const st = useExerciseDefinitionDetailsScreenStyles();

    return (
        <ScreenSection
            title={t('exerciseDefinitions.statsTitle')}
            topSpacing="medium"
        >
            <View style={st.detailGrid}>
                {items.length === 0 && (
                    <ListEmptyState
                        title={t('exerciseDefinitions.emptyStatsTitle')}
                        description={t(
                            'exerciseDefinitions.emptyStatsDescription',
                        )}
                    />
                )}

                {items.map((item) => (
                    <MetricCard
                        key={item.id}
                        label={t(item.labelKey)}
                        value={item.value}
                    />
                ))}
            </View>
        </ScreenSection>
    );
};
