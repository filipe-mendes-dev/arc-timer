import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymExerciseSetLine.styles';

interface GymExerciseSetLineProps {
    details: string;
    index: number;
    isCompleted: boolean;
    isCompleting: boolean;
    isDeleting: boolean;
    isSelectMode: boolean;
    isSelected: boolean;
    onDelete: (set: GymExerciseRecordSet) => void;
    onEdit: (set: GymExerciseRecordSet) => void;
    onSelect: (set: GymExerciseRecordSet) => void;
    onToggleComplete: (set: GymExerciseRecordSet) => void;
    set: GymExerciseRecordSet;
}

const GymExerciseSetLine = ({
    details,
    index,
    isCompleted,
    isCompleting,
    isDeleting,
    isSelectMode,
    isSelected,
    onDelete,
    onEdit,
    onSelect,
    onToggleComplete,
    set,
}: GymExerciseSetLineProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const accentColor = theme.palette.accent.primary;
    const dangerColor = theme.palette.text.error;
    const mutedColor = theme.palette.text.muted;
    const secondaryColor = theme.palette.text.secondary;
    const selectionIconId = isSelected ? 'checkmarkCircle' : 'radioButtonOff';
    const selectionIconColor = isSelected ? accentColor : secondaryColor;
    const completeIconName = isCompleted
        ? 'checkmark-circle'
        : 'checkmark-circle-outline';
    const completeIconColor = isCompleted ? accentColor : mutedColor;
    const isSelectionDisabled = isSelectMode && isCompleted;
    const canPressLine = !isSelectionDisabled && !isCompleted;

    return (
        <View
            style={[
                st.setLine,
                isCompleted && !isSelectMode && st.setLineCompleted,
                isSelected && st.setLineSelected,
            ]}
        >
            <GuardedPressable
                onPress={() => {
                    if (isSelectMode) {
                        onSelect(set);
                        return;
                    }

                    onEdit(set);
                }}
                disabled={!canPressLine}
                isPressedFeedbackDisabled={isSelectMode}
                style={st.setLineMain}
            >
                {isSelectionDisabled && (
                    <View style={st.completedSelectionState}>
                        <AppIcon id="lock" size={22} color={dangerColor} />
                    </View>
                )}

                {isSelectMode && !isSelectionDisabled && (
                    <View style={st.setIndexBubbleSelection}>
                        <AppIcon
                            id={selectionIconId}
                            size={28}
                            color={selectionIconColor}
                        />
                    </View>
                )}

                {!isSelectMode && (
                    <View
                        style={[
                            st.setIndexBubble,
                            isCompleted && st.setIndexBubbleCompleted,
                        ]}
                    >
                        <AppText variant="caption" style={st.setIndexText}>
                            {index + 1}
                        </AppText>
                    </View>
                )}

                <View style={st.setLineText}>
                    <AppText
                        variant="bodySmall"
                        tone={isCompleted ? 'muted' : 'secondary'}
                        style={st.setDetailsText}
                        numberOfLines={2}
                    >
                        {details}
                    </AppText>
                </View>

                {isSelectionDisabled && (
                    <View style={st.completedSelectionPill}>
                        <AppText
                            variant="caption"
                            style={st.completedSelectionPillText}
                            numberOfLines={1}
                        >
                            {t('gymExerciseData.status.complete')}
                        </AppText>
                    </View>
                )}
            </GuardedPressable>

            {!isSelectMode && (
                <View style={st.actionGroup}>
                    <GuardedPressable
                        disabled={isCompleting}
                        onPress={() => onToggleComplete(set)}
                        style={st.iconAction}
                    >
                        <Ionicons
                            name={completeIconName}
                            size={24}
                            color={completeIconColor}
                        />
                    </GuardedPressable>

                    <GuardedPressable
                        disabled={isDeleting}
                        onPress={() => onDelete(set)}
                        style={st.iconAction}
                    >
                        <AppIcon
                            id="trash"
                            size={22}
                            color={theme.palette.text.error}
                        />
                    </GuardedPressable>
                </View>
            )}
        </View>
    );
};

export default GymExerciseSetLine;
