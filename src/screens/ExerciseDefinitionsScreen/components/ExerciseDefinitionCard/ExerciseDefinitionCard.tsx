import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ExerciseDefinitionListItem } from '@src/core/entities/exerciseDefinition.interfaces';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import type { ActionStripProps } from '@src/components/ui/MetaCard/MetaCard.interfaces';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useExerciseDefinitionCardStyles } from './ExerciseDefinitionCard.styles';

interface ExerciseDefinitionCardProps {
    isSelected?: boolean;
    isSelectionLocked?: boolean;
    isSelectMode?: boolean;
    item: ExerciseDefinitionListItem;
    onLockedPress?: () => void;
    onPress?: () => void;
    onRemove?: () => void;
    onSelect?: () => void;
}

interface GetActionStripInput {
    iconColor: string;
    isSelectionLocked: boolean;
    isSelectMode: boolean;
    onLockedPress?: () => void;
    onRemove?: () => void;
    stripBackgroundColor: string;
}

const availabilityLabelKeyByAvailability = {
    both: 'exerciseDefinitions.availability.both',
    gym: 'exerciseDefinitions.availability.gym',
    workout: 'exerciseDefinitions.availability.workout',
} as const;

const getActionStrip = ({
    iconColor,
    isSelectionLocked,
    isSelectMode,
    onLockedPress,
    onRemove,
    stripBackgroundColor,
}: GetActionStripInput): ActionStripProps | undefined => {
    if (isSelectMode) {
        if (!isSelectionLocked) return undefined;

        return {
            icon: <AppIcon id="lock" size={18} color={iconColor} />,
            backgroundColor: stripBackgroundColor,
            onPress: onLockedPress,
        };
    }

    if (!onRemove) return undefined;

    return {
        icon: <AppIcon id="trash" size={18} color={iconColor} />,
        backgroundColor: stripBackgroundColor,
        onPress: onRemove,
    };
};

export const ExerciseDefinitionCard = ({
    isSelected = false,
    isSelectionLocked = false,
    isSelectMode = false,
    item,
    onLockedPress,
    onPress,
    onRemove,
    onSelect,
}: ExerciseDefinitionCardProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseDefinitionCardStyles();
    const actionStrip = getActionStrip({
        iconColor: theme.palette.metaCard.actionStrip.icon,
        isSelectionLocked,
        isSelectMode,
        onLockedPress,
        onRemove,
        stripBackgroundColor: theme.palette.metaCard.actionStrip.background,
    });
    let cardPress = onPress;
    if (isSelectMode) {
        cardPress = isSelectionLocked ? onLockedPress : onSelect;
    }

    return (
        <MetaCard
            showSelectionOutline={isSelected}
            isPressedFeedbackDisabled={isSelectMode}
            expandable={false}
            withBottomFade={false}
            minHeight={50}
            onPress={cardPress}
            actionStrip={actionStrip}
            summaryContent={
                <View style={st.summaryContainer}>
                    <View style={st.titleRow}>
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
                                id="info"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText
                                variant="caption"
                                tone="secondary"
                                numberOfLines={1}
                            >
                                {t(
                                    availabilityLabelKeyByAvailability[
                                        item.availability
                                    ],
                                )}
                            </AppText>
                        </View>
                    </View>
                </View>
            }
        />
    );
};
