import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import type { ActionStripProps } from '@src/components/ui/MetaCard/MetaCard.interfaces';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { GymPlanListItem } from '@src/core/entities/gymPlan.interfaces';
import { useTheme } from '@src/theme/ThemeProvider';

import { useGymPlanItemStyles } from './GymPlanItem.styles';

interface GymPlanItemProps {
    isSelected?: boolean;
    isSelectMode?: boolean;
    item: GymPlanListItem;
    onPress: () => void;
    onRemove: () => void;
    onSelect: () => void;
    onToggleFavorite: () => void;
}

interface GetActionStripInput {
    iconColor: string;
    isSelectMode: boolean;
    onRemove: () => void;
    stripBackgroundColor: string;
}

const getActionStrip = ({
    iconColor,
    isSelectMode,
    onRemove,
    stripBackgroundColor,
}: GetActionStripInput): ActionStripProps | undefined => {
    if (isSelectMode) return undefined;

    return {
        icon: <AppIcon id="trash" size={18} color={iconColor} />,
        backgroundColor: stripBackgroundColor,
        onPress: onRemove,
    };
};

export const GymPlanItem = ({
    isSelected = false,
    isSelectMode = false,
    item,
    onPress,
    onRemove,
    onSelect,
    onToggleFavorite,
}: GymPlanItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useGymPlanItemStyles();
    const isFavorite = item.isFavorite === true;
    const titleLeftIcon = (() => {
        if (isSelectMode) {
            return (
                <AppIcon
                    id={isSelected ? 'checkmarkCircle' : 'radioButtonOff'}
                    size={22}
                    color={
                        isSelected
                            ? theme.palette.accent.primary
                            : theme.palette.text.secondary
                    }
                />
            );
        }

        return (
            <GuardedPressable
                onPress={onToggleFavorite}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <AppIcon
                    id={isFavorite ? 'star' : 'starOutline'}
                    size={22}
                    color={
                        isFavorite
                            ? theme.palette.accent.primary
                            : theme.palette.text.secondary
                    }
                />
            </GuardedPressable>
        );
    })();
    const actionStrip = getActionStrip({
        iconColor: theme.palette.metaCard.actionStrip.icon,
        isSelectMode,
        onRemove,
        stripBackgroundColor: theme.palette.metaCard.actionStrip.background,
    });

    return (
        <MetaCard
            showSelectionOutline={isSelected}
            isPressedFeedbackDisabled={isSelectMode}
            expandable={true}
            withBottomFade={false}
            minHeight={50}
            onPress={isSelectMode ? onSelect : onPress}
            topLeftContent={{
                text: t('gymPlans.card.label'),
                icon: (
                    <AppIcon
                        id="gymPlan"
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
            summaryContent={
                <View style={st.summaryContainer}>
                    <View style={st.titleRow}>
                        {titleLeftIcon}

                        <AppText
                            variant="subtitle"
                            style={st.title}
                            numberOfLines={2}
                        >
                            {item.name}
                        </AppText>
                    </View>

                    <View style={st.metaRow}>
                        <View style={st.metaItem}>
                            <AppIcon
                                id="section"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText
                                variant="caption"
                                tone="secondary"
                                numberOfLines={1}
                            >
                                {t('gymPlans.card.sections', {
                                    count: item.sectionCount,
                                })}
                            </AppText>
                        </View>

                        <View style={st.metaItem}>
                            <AppIcon
                                id="exercise"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText
                                variant="caption"
                                tone="secondary"
                                numberOfLines={1}
                            >
                                {t('gymPlans.card.exercises', {
                                    count: item.exerciseCount,
                                })}
                            </AppText>
                        </View>
                    </View>
                </View>
            }
        />
    );
};
