import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { GymPlanSection } from '@src/core/entities/gym.interfaces';
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

const SHAKE_DISTANCE = 1;
const SHAKE_STEP_MS = 300;
const PAUSE_BETWEEN_SHAKES_MS = 500;
const INITIAL_DELAY_STAGGER_MS = 90;

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
    const wiggleValue = useSharedValue<number>(0);

    const plannedSetCount = useMemo(
        () =>
            section.exercises.reduce(
                (total, exercise) => total + (exercise.targetSets ?? 0),
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

    const wiggleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: wiggleValue.value }],
    }));

    useEffect(() => {
        if (!isWiggling) {
            cancelAnimation(wiggleValue);
            wiggleValue.value = 0;
            return;
        }

        const initialDelayMs = index * INITIAL_DELAY_STAGGER_MS;
        const easing = Easing.inOut(Easing.quad);

        wiggleValue.value = withDelay(
            initialDelayMs,
            withRepeat(
                withSequence(
                    withTiming(SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(-SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(0, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withDelay(
                        PAUSE_BETWEEN_SHAKES_MS,
                        withTiming(0, {
                            duration: 0,
                            easing,
                        }),
                    ),
                ),
                -1,
            ),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, isWiggling]);

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
        <Animated.View style={isWiggling ? wiggleAnimatedStyle : undefined}>
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
                                                        count:
                                                            exercise.targetSets ??
                                                            0,
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
        </Animated.View>
    );
};
