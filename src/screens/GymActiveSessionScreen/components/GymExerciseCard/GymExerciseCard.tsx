import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import type {
    GymExerciseRecord,
    GymExerciseRecordSet,
} from '@src/core/entities/gym.interfaces';
import { useTheme } from '@src/theme/ThemeProvider';

import { useGymExerciseCardStyles } from './GymExerciseCard.styles';

interface GymExerciseCardProps {
    exerciseName: string;
    onRemove: () => void;
    onPress: () => void;
    record: GymExerciseRecord;
}

const formatWeight = (weightGrams: number): string => {
    const weightKg = weightGrams / 1000;
    return Number.isInteger(weightKg) ? `${weightKg}` : weightKg.toFixed(1);
};

export const GymExerciseCard = ({
    exerciseName,
    onRemove,
    onPress,
    record,
}: GymExerciseCardProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useGymExerciseCardStyles();
    const setCount = record.sets.length;
    const isComplete = record.completedAtMs !== undefined;
    const statusText = isComplete
        ? t('gymActiveSession.status.complete')
        : t('gymActiveSession.status.inProgress');
    const statusIconId = isComplete ? 'checkmarkCircle' : 'radioButtonOff';
    const statusBackgroundColor = isComplete
        ? theme.palette.accent.primary
        : theme.palette.accent.soft;
    const statusTextColor = isComplete
        ? theme.palette.text.inverted
        : theme.palette.text.secondary;
    const measureKey = [
        record.id,
        record.sets.length,
        record.completedAtMs ?? '',
    ].join(':');

    const getSetDetails = (set: GymExerciseRecordSet): string => {
        const details: string[] = [];

        if (set.reps !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.reps', { count: set.reps }),
            );
        }

        if (set.weightGrams !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.weight', {
                    value: formatWeight(set.weightGrams),
                }),
            );
        }

        if (set.durationSec !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.duration', {
                    value: set.durationSec,
                }),
            );
        }

        if (set.distanceMeters !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.distance', {
                    value: set.distanceMeters,
                }),
            );
        }

        if (details.length === 0) {
            return t('gymExerciseData.setDetails.empty');
        }

        return details.join(' · ');
    };

    return (
        <MetaCard
            measureKey={measureKey}
            topLeftContent={{
                text: statusText,
                icon: (
                    <AppIcon
                        id={statusIconId}
                        size={14}
                        color={statusTextColor}
                    />
                ),
                backgroundColor: statusBackgroundColor,
                color: statusTextColor,
                borderColor: statusBackgroundColor,
            }}
            actionStrip={{
                icon: (
                    <AppIcon
                        id="trash"
                        size={18}
                        color={theme.palette.metaCard.actionStrip.icon}
                    />
                ),
                backgroundColor: theme.palette.metaCard.actionStrip.background,
                onPress: onRemove,
            }}
            expandable
            initiallyExpanded={false}
            withBottomFade={false}
            minHeight={0}
            onPress={onPress}
            summaryContent={
                <View style={st.body}>
                    <AppText variant="body" style={st.exerciseName}>
                        {exerciseName}
                    </AppText>

                    <View style={st.metaRow}>
                        <AppIcon
                            id="sets"
                            size={14}
                            color={theme.palette.text.secondary}
                        />
                        <AppText variant="bodySmall" tone="secondary">
                            {t('common.units.set', { count: setCount })}
                        </AppText>
                    </View>
                </View>
            }
            collapsibleContent={
                <View style={st.body}>
                    <View style={st.setsContainer}>
                        {record.sets.map((set) => (
                            <View key={set.id} style={st.setRow}>
                                <View style={st.setIndexBubble}>
                                    <AppText
                                        variant="caption"
                                        style={st.setIndexText}
                                    >
                                        {set.setIndex + 1}
                                    </AppText>
                                </View>

                                <View style={st.setTexts}>
                                    <AppText variant="bodySmall" tone="primary">
                                        {t('gymExerciseData.setWithIndex', {
                                            index: set.setIndex + 1,
                                        })}
                                    </AppText>

                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        numberOfLines={1}
                                    >
                                        {getSetDetails(set)}
                                    </AppText>
                                </View>
                            </View>
                        ))}

                        {record.sets.length === 0 && (
                            <AppText variant="bodySmall" tone="secondary">
                                {t('gymExerciseData.noSetsTitle')}
                            </AppText>
                        )}
                    </View>
                </View>
            }
        />
    );
};
