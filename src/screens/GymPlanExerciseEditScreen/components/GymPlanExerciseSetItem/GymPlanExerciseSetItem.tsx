import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { GymPlanExerciseTargetSet } from '@src/core/entities/gym.interfaces';
import { useTheme } from '@src/theme/ThemeProvider';
import type { AppTheme } from '@src/theme/theme';

import { useStyles } from './GymPlanExerciseSetItem.style';

interface GymPlanExerciseSetItemProps {
    details: string;
    index: number;
    isSelectMode: boolean;
    isSelected: boolean;
    onDelete: (set: GymPlanExerciseTargetSet) => void;
    onPress: (set: GymPlanExerciseTargetSet) => void;
    set: GymPlanExerciseTargetSet;
}

const GymPlanExerciseSetItem = ({
    details,
    index,
    isSelectMode,
    isSelected,
    onDelete,
    onPress,
    set,
}: GymPlanExerciseSetItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const selectionIconId = isSelected ? 'checkmarkCircle' : 'radioButtonOff';
    const selectionIconColor = getSelectionIconColor(isSelected, theme);

    return (
        <View style={[st.setLine, isSelected && st.setLineSelected]}>
            <GuardedPressable
                onPress={() => onPress(set)}
                style={st.setLineMain}
            >
                <View
                    style={[
                        st.setIndexBubble,
                        isSelectMode && st.setIndexBubbleSelectMode,
                        isSelected && st.setIndexBubbleSelected,
                    ]}
                >
                    {isSelectMode && (
                        <AppIcon
                            id={selectionIconId}
                            size={28}
                            color={selectionIconColor}
                        />
                    )}

                    {!isSelectMode && (
                        <AppText variant="caption" style={st.setIndexText}>
                            {index + 1}
                        </AppText>
                    )}
                </View>

                <View style={st.setLineText}>
                    <AppText
                        variant="bodySmall"
                        style={st.setTitle}
                        numberOfLines={1}
                    >
                        {t('gymExerciseData.setWithIndex', {
                            index: index + 1,
                        })}
                    </AppText>
                    <AppText
                        variant="bodySmall"
                        tone="secondary"
                        style={st.setDetailsText}
                        numberOfLines={2}
                    >
                        {details}
                    </AppText>
                </View>
            </GuardedPressable>

            {!isSelectMode && (
                <GuardedPressable
                    onPress={() => onDelete(set)}
                    style={st.iconAction}
                >
                    <AppIcon
                        id="trash"
                        size={22}
                        color={theme.palette.text.error}
                    />
                </GuardedPressable>
            )}
        </View>
    );
};

const getSelectionIconColor = (
    isSelected: boolean,
    theme: AppTheme,
): string => {
    if (isSelected) return theme.palette.accent.primary;

    return theme.palette.text.secondary;
};

export default GymPlanExerciseSetItem;
