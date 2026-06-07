import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon, type IconId } from '@src/components/ui/Icon/AppIcon';
import { IndexedListItem } from '@src/components/ui/IndexedListItem';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';
import { useTheme } from '@src/theme/ThemeProvider';

import type { ExerciseSummary } from '../../GymSessionSummaryScreen.interfaces';
import { useStyles } from './GymSessionExerciseSummaryItem.styles';

interface GymSessionExerciseSummaryItemProps {
    exercise: ExerciseSummary;
    getSetDetails: (set: GymExerciseRecordSet) => string;
    index: number;
}

const getSetStatusIconId = (set: GymExerciseRecordSet): IconId => {
    if (set.completedAtMs !== undefined) {
        return 'checkmarkCircle';
    }

    return 'radioButtonOff';
};

export const GymSessionExerciseSummaryItem = ({
    exercise,
    getSetDetails,
    index,
}: GymSessionExerciseSummaryItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const completedSetCount = exercise.completedSets.length;

    const getSetStatusIconColor = (set: GymExerciseRecordSet): string => {
        if (set.completedAtMs !== undefined) {
            return theme.palette.accent.primary;
        }

        return theme.palette.text.muted;
    };

    return (
        <View style={st.exerciseItem}>
            <IndexedListItem
                index={index}
                mainContent={exercise.exerciseName}
                secondaryContent={t('common.units.set', {
                    count: completedSetCount,
                })}
            />

            <View style={st.exerciseSetsContainer}>
                {exercise.completedSets.map((set) => (
                    <View key={set.id} style={st.setRow}>
                        <AppIcon
                            id={getSetStatusIconId(set)}
                            size={18}
                            color={getSetStatusIconColor(set)}
                            style={st.setStatusIcon}
                        />

                        <View style={st.setSummary}>
                            <AppText
                                variant="bodySmall"
                                style={st.setTitle}
                                numberOfLines={1}
                            >
                                {t('gymExerciseData.setWithIndex', {
                                    index: set.setIndex + 1,
                                })}
                                :
                            </AppText>

                            <AppText
                                variant="bodySmall"
                                tone="muted"
                                style={st.setDetails}
                                numberOfLines={1}
                            >
                                {getSetDetails(set)}
                            </AppText>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};
