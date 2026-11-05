import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { MetricCard } from '@src/components/ui/MetricCard';
import { Button } from '@src/components/ui/Button/Button';

import type { ExerciseDefinitionStatItem } from '../ExerciseDefinitionDetailsScreen.helpers';
import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

interface ExerciseDefinitionStatsSectionProps {
    exerciseDefinitionId: string;
    items: readonly ExerciseDefinitionStatItem[];
}

export const ExerciseDefinitionStatsSection = ({
    exerciseDefinitionId,
    items,
}: ExerciseDefinitionStatsSectionProps) => {
    const { t } = useTranslation();
    const router = useRouter();
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
                        description={t('exerciseDefinitions.emptyStatsDescription')}
                        size="small"
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
            <Button
                title={t('statistics.viewProgress')}
                variant="secondary"
                onPress={() =>
                    router.push({
                        pathname: '/statistics/exercise/[id]',
                        params: { id: exerciseDefinitionId },
                    })
                }
            />
        </ScreenSection>
    );
};
