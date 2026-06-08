import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { GymExerciseRecordSet } from '@src/core/entities/gymSession.interfaces';
import { useTheme } from '@src/theme/ThemeProvider';

import type { SectionSummary } from '../../GymSessionSummaryScreen.interfaces';
import { GymSessionExerciseSummaryItem } from '../GymSessionExerciseSummaryItem';
import { useStyles } from './GymSessionSectionItem.styles';

interface GymSessionSectionItemProps {
    getSetDetails: (set: GymExerciseRecordSet) => string;
    onExercisePress: (exerciseDefinitionId: string) => void;
    section: SectionSummary;
}

export const GymSessionSectionItem = ({
    getSetDetails,
    onExercisePress,
    section,
}: GymSessionSectionItemProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const measureKey = [
        section.id,
        section.exerciseCount,
        section.completedSetCount,
        section.setCount,
    ].join(':');
    const sectionMeta = [
        t('common.units.exercise', {
            count: section.exerciseCount,
        }),
        t('common.units.set', {
            count: section.completedSetCount,
        }),
    ].join(' • ');

    return (
        <MetaCard
            expandable={false}
            measureKey={measureKey}
            topLeftContent={{
                text: section.label,
                icon: (
                    <Ionicons
                        name="list-outline"
                        size={14}
                        color={theme.palette.metaCard.topLeftContent.text}
                    />
                ),
            }}
            summaryContent={
                <View style={st.sectionExercisesContainer}>
                    <View style={st.sectionMetaRow}>
                        <AppIcon
                            id="exercise"
                            size={14}
                            color={theme.palette.text.secondary}
                        />
                        <AppText
                            variant="bodySmall"
                            tone="secondary"
                            numberOfLines={2}
                            style={st.sectionMetaText}
                        >
                            {sectionMeta}
                        </AppText>
                    </View>

                    {section.records.map((exercise, exerciseIndex) => (
                        <GymSessionExerciseSummaryItem
                            key={exercise.record.id}
                            exercise={exercise}
                            index={exerciseIndex}
                            getSetDetails={getSetDetails}
                            onExercisePress={onExercisePress}
                        />
                    ))}
                </View>
            }
        />
    );
};
