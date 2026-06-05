import { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { WiggleView } from '@src/components/ui/WiggleView';
import type { GymPlanSection } from '@src/core/entities/gym.interfaces';
import { getGymPlanExerciseTargetSets } from '@src/core/gyms/gymPlanTargetSets';
import { useTheme } from '@src/theme/ThemeProvider';

import { useGymPlanSectionItemStyles } from './GymPlanSectionItem.styles';

interface GymPlanSectionItemProps {
    definitionNameById: ReadonlyMap<string, string>;
    index: number;
    isWiggling?: boolean;
    onPress: (sectionId: string) => void;
    onRemove: (sectionId: string) => void;
    section: GymPlanSection;
}

export const GymPlanSectionItem = ({
    definitionNameById,
    index,
    isWiggling = false,
    onPress,
    onRemove,
    section,
}: GymPlanSectionItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useGymPlanSectionItemStyles();

    const plannedSetCount = useMemo(
        () =>
            section.exercises.reduce(
                (total, exercise) =>
                    total + getGymPlanExerciseTargetSets(exercise).length,
                0,
            ),
        [section.exercises],
    );

    const metaParts = useMemo(
        () => [
            t('gymPlanBuilder.exerciseCount', {
                count: section.exercises.length,
            }),
            t('gymPlanBuilder.plannedSetCount', {
                count: plannedSetCount,
            }),
        ],
        [plannedSetCount, section.exercises.length, t],
    );

    const trimmedTitle = section.title?.trim();
    let sectionLabel = t('gymPlanBuilder.sectionFallback', {
        index: index + 1,
    });
    if (trimmedTitle && trimmedTitle.length > 0) {
        sectionLabel = trimmedTitle;
    }

    const actionStrip = {
        icon: (
            <Ionicons
                name="trash-outline"
                size={18}
                color={theme.palette.metaCard.actionStrip.icon}
            />
        ),
        backgroundColor: theme.palette.metaCard.actionStrip.background,
        onPress: () => onRemove(section.id),
    };

    const measureKey = [
        section.id,
        section.title ?? '',
        section.exercises.length,
        plannedSetCount,
    ].join(':');

    return (
        <WiggleView index={index} isWiggling={isWiggling}>
            <MetaCard
                measureKey={measureKey}
                topLeftContent={{
                    text: sectionLabel,
                    icon: (
                        <Ionicons
                            name="list-outline"
                            size={14}
                            color={theme.palette.metaCard.topLeftContent.text}
                        />
                    ),
                    backgroundColor:
                        theme.palette.metaCard.topLeftContent.background,
                    color: theme.palette.metaCard.topLeftContent.text,
                    borderColor: theme.palette.metaCard.topLeftContent.border,
                }}
                actionStrip={actionStrip}
                expandable
                initiallyExpanded
                withBottomFade={false}
                minHeight={0}
                onPress={() => onPress(section.id)}
                summaryContent={
                    <View style={st.body}>
                        <View style={st.sectionInfoRow}>
                            <Ionicons
                                name="barbell-outline"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText variant="bodySmall" tone="secondary">
                                {metaParts.join(' • ')}
                            </AppText>
                        </View>
                    </View>
                }
                collapsibleContent={
                    <View style={st.body}>
                        <View style={st.exercisesContainer}>
                            {section.exercises.map((exercise, exerciseIndex) => {
                                let exerciseName =
                                    definitionNameById.get(
                                        exercise.exerciseDefinitionId,
                                    ) ??
                                    t('gymPlanBuilder.exerciseFallback', {
                                        index: exerciseIndex + 1,
                                    });
                                if (exercise.name) {
                                    exerciseName = exercise.name;
                                }
                                const exercisePlannedSetCount =
                                    getGymPlanExerciseTargetSets(
                                        exercise,
                                    ).length;

                                return (
                                    <View
                                        key={exercise.id}
                                        style={st.exerciseRow}
                                    >
                                        <View style={st.exerciseIndexBubble}>
                                            <AppText
                                                variant="caption"
                                                style={st.exerciseIndexText}
                                            >
                                                {exerciseIndex + 1}
                                            </AppText>
                                        </View>

                                        <View style={st.exerciseTexts}>
                                            <AppText
                                                variant="bodySmall"
                                                tone="primary"
                                                numberOfLines={1}
                                            >
                                                {exerciseName}
                                            </AppText>

                                            <AppText
                                                variant="caption"
                                                tone="muted"
                                                numberOfLines={1}
                                            >
                                                {t(
                                                    'gymPlanBuilder.plannedSetCount',
                                                    {
                                                        count: exercisePlannedSetCount,
                                                    },
                                                )}
                                            </AppText>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                }
            />
        </WiggleView>
    );
};
