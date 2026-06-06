import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { WiggleView } from '@src/components/ui/WiggleView';
import type { GymPlanExercise } from '@src/core/entities/gymPlan.interfaces';
import { getGymPlanExerciseTargetSets } from '@src/core/gyms/gymPlanTargetSets';
import { getSetDetails } from '@src/screens/GymExerciseDataScreen/GymExerciseDataScreen.helpers';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymPlanExerciseCard.styles';

interface GymPlanExerciseCardProps {
    definitionName: string;
    exercise: GymPlanExercise;
    index: number;
    isWiggling?: boolean;
    onPress: () => void;
    onRemove: () => void;
}

export const GymPlanExerciseCard: React.FC<GymPlanExerciseCardProps> = ({
    definitionName,
    exercise,
    index,
    isWiggling = false,
    onPress,
    onRemove,
}) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();

    const fallbackName = t('gymPlanBuilder.exerciseFallback', {
        index: index + 1,
    });
    const trimmedDefinitionName = definitionName.trim();
    const exerciseName =
        trimmedDefinitionName.length > 0 ? trimmedDefinitionName : fallbackName;
    const targetSets = getGymPlanExerciseTargetSets(exercise);
    const setCount = targetSets.length;
    const measureKey = [
        exercise.id,
        exerciseName,
        targetSets.length,
        targetSets.map((set) => set.id).join(','),
    ].join(':');

    return (
        <WiggleView index={index} isWiggling={isWiggling}>
            <MetaCard
                measureKey={measureKey}
                onPress={onPress}
                topLeftContent={{
                    text: exerciseName,
                    icon: (
                        <AppIcon
                            id="exercise"
                            size={14}
                            color={theme.palette.metaCard.topLeftContent.text}
                        />
                    ),
                }}
                actionStrip={{
                    icon: (
                        <AppIcon
                            id="trash"
                            size={18}
                            color={theme.palette.metaCard.actionStrip.icon}
                        />
                    ),
                    backgroundColor:
                        theme.palette.metaCard.actionStrip.background,
                    onPress: onRemove,
                }}
                summaryContent={
                    <View style={st.body}>
                        <View style={st.metaRow}>
                            <AppIcon
                                id="sets"
                                size={10}
                                color={theme.palette.text.secondary}
                            />
                            <AppText variant="bodySmall" tone="secondary">
                                {t('common.units.set', { count: setCount })}
                            </AppText>
                        </View>
                    </View>
                }
                expandable
                initiallyExpanded
                withBottomFade={false}
                minHeight={0}
                collapsibleContent={
                    <View style={st.setsContainer}>
                        {targetSets.map((set, setIndex) => (
                            <View key={set.id} style={st.setRow}>
                                <AppText
                                    variant="bodySmall"
                                    tone="muted"
                                    style={st.setBullet}
                                >
                                    {'\u2022'}
                                </AppText>

                                <View style={st.setSummary}>
                                    <AppText
                                        variant="bodySmall"
                                        style={st.setTitle}
                                        numberOfLines={1}
                                    >
                                        {t('gymExerciseData.setWithIndex', {
                                            index: setIndex + 1,
                                        })}
                                        :
                                    </AppText>

                                    <AppText
                                        variant="bodySmall"
                                        tone="muted"
                                        style={st.setDetails}
                                        numberOfLines={1}
                                    >
                                        {getSetDetails(
                                            { ...set, isWarmup: false },
                                            t,
                                        )}
                                    </AppText>
                                </View>
                            </View>
                        ))}

                        {targetSets.length === 0 && (
                            <AppText variant="bodySmall" tone="secondary">
                                {t('gymExerciseData.noSetsTitle')}
                            </AppText>
                        )}
                    </View>
                }
            />
        </WiggleView>
    );
};
