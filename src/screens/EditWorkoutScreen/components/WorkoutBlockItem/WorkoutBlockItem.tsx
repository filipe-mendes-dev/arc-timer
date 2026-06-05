import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { WorkoutBlock } from '@src/core/entities/entities';
import { IndexedListItem } from '@src/components/ui/IndexedListItem';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { WiggleView } from '@src/components/ui/WiggleView';
import { useTheme } from '@src/theme/ThemeProvider';
import { useWorkoutBlockItemStyles } from './WorkoutBlockItem.styles';
import { useTranslation } from 'react-i18next';

type WorkoutBlockItemProps = {
    index: number;
    block: WorkoutBlock;
    onPress?: (id: string) => void;
    onRemove?: (id: string) => void;
    expanded?: boolean;
    initiallyExpanded?: boolean;

    isWiggling?: boolean;
};

export const WorkoutBlockItem = ({
    index,
    block,
    onPress,
    onRemove,
    expanded = false,
    initiallyExpanded = false,
    isWiggling = false,
}: WorkoutBlockItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useWorkoutBlockItemStyles();
    const { sets, exercises } = block;

    const exerciseSummary = useMemo(() => {
        if (exercises.length === 0) return '';

        const first = exercises[0];
        const allSame = exercises.every(
            (ex) => ex.mode === first.mode && ex.value === first.value
        );

        if (!allSame) return '';
        return first.mode === 'time'
            ? t('workoutBlockItem.summary.timeEach', { value: first.value })
            : t('workoutBlockItem.summary.repsEach', { value: first.value });
    }, [exercises, t]);

    const metaParts = useMemo(() => {
        const parts: string[] = [
            t('common.units.set', { count: sets }),
            t('common.units.exercise', { count: exercises.length }),
        ];
        if (exerciseSummary) parts.push(exerciseSummary);
        return parts;
    }, [sets, exercises.length, exerciseSummary, t]);

    const trimmedTitle = block.title?.trim();
    const blockLabel =
        trimmedTitle && trimmedTitle.length > 0
            ? trimmedTitle
            : t('common.labels.blockWithIndex', { index: index + 1 });

    const formatExerciseMeta = (
        mode: WorkoutBlock['exercises'][number]['mode'],
        value: number,
        restSec?: number
    ): string => {
        const main =
            mode === 'time'
                ? t('workoutBlockItem.exerciseMeta.time', { value })
                : t(
                      value === 1
                          ? 'workoutBlockItem.exerciseMeta.reps_one'
                          : 'workoutBlockItem.exerciseMeta.reps_other',
                      { count: value }
                  );
        return restSec && restSec > 0
            ? `${main} • ${t('workoutBlockItem.exerciseMeta.rest', { value: restSec })}`
            : main;
    };

    const handlePress = onPress ? () => onPress(block.id) : undefined;

    const actionStrip = onRemove
        ? {
              icon: (
                  <Ionicons
                      name="trash-outline"
                      size={18}
                      color={theme.palette.metaCard.actionStrip.icon}
                  />
              ),
              backgroundColor: theme.palette.metaCard.actionStrip.background,
              onPress: () => onRemove(block.id),
          }
        : undefined;

    const measureKey = [
        block.id,
        block.sets,
        block.exercises.length,
        block.restBetweenSetsSec,
        block.restBetweenExercisesSec,
    ].join(':');

    return (
        <WiggleView index={index} isWiggling={isWiggling}>
            <MetaCard
                measureKey={measureKey}
                topLeftContent={{
                    text: blockLabel,
                    icon: (
                        <Ionicons
                            name="layers-outline"
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
                expandable={!expanded}
                initiallyExpanded={initiallyExpanded}
                withBottomFade={false}
                minHeight={0}
                onPress={handlePress}
                summaryContent={
                    <View style={st.body}>
                        <View style={st.blockInfoRow}>
                            <Ionicons
                                name="timer-outline"
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
                            {exercises.map((ex, i) => {
                                const mainContent =
                                    ex.name ??
                                    t(
                                        'workoutBlockItem.labels.exerciseWithIndex',
                                        {
                                            index: i + 1,
                                        },
                                    );
                                const secondaryContent = formatExerciseMeta(
                                    ex.mode,
                                    ex.value,
                                );

                                return (
                                    <IndexedListItem
                                        key={ex.id}
                                        index={i}
                                        mainContent={mainContent}
                                        secondaryContent={secondaryContent}
                                    />
                                );
                            })}
                        </View>
                    </View>
                }
            />
        </WiggleView>
    );
};
