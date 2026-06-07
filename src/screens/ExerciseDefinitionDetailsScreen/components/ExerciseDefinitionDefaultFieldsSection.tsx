import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetricCard } from '@src/components/ui/MetricCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import type { ExerciseDefinitionMetricItem } from '../ExerciseDefinitionDetailsScreen.helpers';
import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

interface ExerciseDefinitionDefaultFieldsSectionProps {
    items: readonly ExerciseDefinitionMetricItem[];
    onPressField: (field: ExerciseDefinitionMetricItem['field']) => void;
}

export const ExerciseDefinitionDefaultFieldsSection = ({
    items,
    onPressField,
}: ExerciseDefinitionDefaultFieldsSectionProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseDefinitionDetailsScreenStyles();

    return (
        <ScreenSection
            title={t('exerciseDefinitions.defaults')}
            topSpacing="medium"
        >
            <View style={st.detailGrid}>
                {items.length === 0 ? (
                    <ListEmptyState
                        title={t('exerciseDefinitions.emptyDefaultsTitle')}
                        description={t(
                            'exerciseDefinitions.emptyDefaultsDescription',
                        )}
                    />
                ) : (
                    <FlatList
                        data={items}
                        numColumns={2}
                        keyExtractor={(item) => item.field}
                        scrollEnabled={false}
                        contentContainerStyle={st.flatList}
                        renderItem={({ item }) => (
                            <MetricCard
                                key={item.field}
                                label={t(item.labelKey)}
                                value={
                                    <View style={st.editableMetricValue}>
                                        <AppText
                                            variant="bodySmall"
                                            style={st.editableMetricText}
                                            numberOfLines={1}
                                        >
                                            {item.value}
                                        </AppText>
                                        <AppIcon
                                            id="edit"
                                            size={14}
                                            color={theme.palette.text.muted}
                                        />
                                    </View>
                                }
                                onPress={() => onPressField(item.field)}
                            />
                        )}
                    />
                )}
            </View>
        </ScreenSection>
    );
};
