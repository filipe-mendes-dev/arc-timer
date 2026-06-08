import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { IndexedListItem } from '@src/components/ui/IndexedListItem';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { WiggleView } from '@src/components/ui/WiggleView';
import type { GymPlanSection } from '@src/core/entities/gymPlan.interfaces';
import { useTheme } from '@src/theme/ThemeProvider';

import {
    type GymPlanSectionItemCopyScope,
    getDisplayName,
    getExerciseCountLabel,
    getExerciseFallbackLabel,
    getExercisePlannedSetCount,
    getPlannedSetCount,
    getPlannedSetCountLabel,
    getSectionFallbackLabel,
} from './GymPlanSectionItem.helpers';
import { useGymPlanSectionItemStyles } from './GymPlanSectionItem.styles';

interface GymPlanSectionItemProps {
    copyScope?: GymPlanSectionItemCopyScope;
    definitionNameById: ReadonlyMap<string, string>;
    index: number;
    isWiggling?: boolean;
    onExercisePress?: (exerciseDefinitionId: string) => void;
    onPress?: (sectionId: string) => void;
    onRemove?: (sectionId: string) => void;
    section: GymPlanSection;
}

export const GymPlanSectionItem = ({
    copyScope = 'builder',
    definitionNameById,
    index,
    isWiggling = false,
    onExercisePress,
    onPress,
    onRemove,
    section,
}: GymPlanSectionItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useGymPlanSectionItemStyles();
    const hasExercises = section.exercises.length > 0;

    const plannedSetCount = useMemo(
        () => getPlannedSetCount(section),
        [section],
    );

    const metaParts = useMemo(
        () => [
            getExerciseCountLabel(section.exercises.length, copyScope, t),
            getPlannedSetCountLabel(plannedSetCount, copyScope, t),
        ],
        [copyScope, plannedSetCount, section.exercises.length, t],
    );

    const trimmedTitle = section.title?.trim();
    const fallbackSectionLabel = getSectionFallbackLabel(index, copyScope, t);
    const sectionLabel = getDisplayName(trimmedTitle, fallbackSectionLabel);

    const handlePress = useCallback(() => {
        if (onPress) onPress(section.id);
        return;
    }, [onPress, section.id]);

    const getExercisePressHandler = useCallback(
        (exerciseDefinitionId: string): (() => void) | undefined => {
            if (!onExercisePress) return undefined;

            return () => onExercisePress(exerciseDefinitionId);
        },
        [onExercisePress],
    );

    const measureKey = [
        section.id,
        section.title ?? '',
        section.exercises.length,
        plannedSetCount,
    ].join(':');

    return (
        <WiggleView index={index} isWiggling={isWiggling}>
            <MetaCard
                key={hasExercises ? 'withExercises' : 'empty'}
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
                actionStrip={
                    onRemove && {
                        icon: (
                            <Ionicons
                                name="trash-outline"
                                size={18}
                                color={theme.palette.metaCard.actionStrip.icon}
                            />
                        ),
                        backgroundColor:
                            theme.palette.metaCard.actionStrip.background,
                        onPress: () => onRemove(section.id),
                    }
                }
                expandable={hasExercises}
                initiallyExpanded={hasExercises}
                withBottomFade={false}
                minHeight={0}
                onPress={onPress && handlePress}
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
                    hasExercises ? (
                        <View style={st.body}>
                            <View style={st.exercisesContainer}>
                                {section.exercises.map(
                                    (exercise, exerciseIndex) => {
                                        const fallbackName =
                                            definitionNameById.get(
                                                exercise.exerciseDefinitionId,
                                            ) ??
                                            getExerciseFallbackLabel(
                                                exerciseIndex,
                                                copyScope,
                                                t,
                                            );
                                        const exerciseName = getDisplayName(
                                            exercise.name,
                                            fallbackName,
                                        );
                                        const exercisePlannedSetCount =
                                            getExercisePlannedSetCount(
                                                exercise,
                                            );
                                        const secondaryContent =
                                            getPlannedSetCountLabel(
                                                exercisePlannedSetCount,
                                                copyScope,
                                                t,
                                            );
                                        const handleExercisePress =
                                            getExercisePressHandler(
                                                exercise.exerciseDefinitionId,
                                            );

                                        return (
                                            <IndexedListItem
                                                key={exercise.id}
                                                index={exerciseIndex}
                                                mainContent={exerciseName}
                                                onPress={handleExercisePress}
                                                secondaryContent={
                                                    secondaryContent
                                                }
                                            />
                                        );
                                    },
                                )}
                            </View>
                        </View>
                    ) : undefined
                }
            />
        </WiggleView>
    );
};
