import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ExerciseDefinition } from '@src/core/entities/exerciseDefinition.interfaces';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { MetricCard } from '@src/components/ui/MetricCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { availabilityLabelKeyByAvailability } from '../ExerciseDefinitionDetailsScreen.helpers';
import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

interface ExerciseDefinitionOverviewSectionProps {
    definition: ExerciseDefinition;
    onPressAvailability: () => void;
    onPressName: () => void;
}

export const ExerciseDefinitionOverviewSection = ({
    definition,
    onPressAvailability,
    onPressName,
}: ExerciseDefinitionOverviewSectionProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseDefinitionDetailsScreenStyles();

    const editIcon = (
        <AppIcon id="edit" size={14} color={theme.palette.text.muted} />
    );

    return (
        <ScreenSection title={t('exerciseDefinitions.overview')} gap={12}>
            <MetaCard
                expandable={false}
                // topLeftContent={{
                //     text: t('gymExerciseData.overview'),
                //     icon: (
                //         <AppIcon
                //             id="exercise"
                //             size={14}
                //             color={theme.palette.metaCard.topLeftContent.text}
                //         />
                //     ),
                //     backgroundColor:
                //         theme.palette.metaCard.topLeftContent.background,
                //     color: theme.palette.metaCard.topLeftContent.text,
                //     borderColor: theme.palette.metaCard.topLeftContent.border,
                // }}
                summaryContent={
                    <View style={st.overviewContainer}>
                        <MetricCard
                            numberOfLines={2}
                            label={t('exerciseDefinitions.fields.name')}
                            value={
                                <View style={st.editableMetricValue}>
                                    <AppText
                                        variant="bodySmall"
                                        style={st.editableMetricText}
                                        numberOfLines={1}
                                    >
                                        {definition.name}
                                    </AppText>
                                    {editIcon}
                                </View>
                            }
                            onPress={onPressName}
                        />

                        <MetricCard
                            numberOfLines={2}
                            label={t('exerciseDefinitions.fields.availability')}
                            value={
                                <View style={st.editableMetricValue}>
                                    <AppText
                                        variant="bodySmall"
                                        style={st.editableMetricText}
                                        numberOfLines={1}
                                    >
                                        {t(
                                            availabilityLabelKeyByAvailability[
                                                definition.availability
                                            ],
                                        )}
                                    </AppText>
                                    {editIcon}
                                </View>
                            }
                            onPress={onPressAvailability}
                        />
                    </View>
                }
            />
        </ScreenSection>
    );
};
