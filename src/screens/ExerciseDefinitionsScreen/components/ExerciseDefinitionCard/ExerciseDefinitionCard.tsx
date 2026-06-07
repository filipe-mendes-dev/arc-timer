import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    isSelectMode?: boolean;
    item: ExerciseDefinitionListItem;
    onPress?: () => void;
    onRemove?: () => void;
    onSelect?: () => void;
}

interface GetActionStripInput {
    iconColor: string;
    isSelectMode: boolean;
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
    isSelectMode,
    onRemove,
    stripBackgroundColor,
}: GetActionStripInput): ActionStripProps | undefined => {
    if (isSelectMode || !onRemove) return undefined;

    return {
        icon: <AppIcon id="trash" size={18} color={iconColor} />,
        backgroundColor: stripBackgroundColor,
        onPress: onRemove,
    };
};

export const ExerciseDefinitionCard = ({
    isSelected = false,
    isSelectMode = false,
    item,
    onPress,
    onRemove,
    onSelect,
}: ExerciseDefinitionCardProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseDefinitionCardStyles();
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
            expandable={false}
            withBottomFade={false}
            minHeight={50}
            onPress={isSelectMode ? onSelect : onPress}
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
                            <Ionicons
                                name="options-outline"
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
