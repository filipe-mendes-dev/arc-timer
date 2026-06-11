import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type {
    ExerciseDefinitionReferenceItem,
    ExerciseDefinitionReferenceKind,
} from '@src/core/entities/exerciseDefinition.interfaces';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import type { I18nKey } from '@src/i18n/i18nKey';

import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

interface ExerciseDefinitionReferenceRowProps {
    onPress: () => void;
    reference: ExerciseDefinitionReferenceItem;
}

const referenceLabelKeyByKind: Record<
    ExerciseDefinitionReferenceKind,
    I18nKey
> = {
    gymPlan: 'exerciseDefinitions.references.gymPlan',
    workout: 'exerciseDefinitions.references.workout',
};

export const ExerciseDefinitionReferenceRow = ({
    onPress,
    reference,
}: ExerciseDefinitionReferenceRowProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseDefinitionDetailsScreenStyles();

    return (
        <GuardedPressable onPress={onPress} style={st.sessionRow}>
            <View style={st.sessionInfo}>
                <AppText
                    variant="bodySmall"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={st.sessionTitle}
                >
                    {reference.name}
                </AppText>
            </View>

            <View style={st.sessionDurationPill}>
                <Ionicons
                    name="link-outline"
                    size={14}
                    color={theme.palette.metaCard.datePill.icon}
                />
                <AppText
                    variant="caption"
                    tone="secondary"
                    style={st.sessionDurationText}
                    numberOfLines={1}
                >
                    {t(referenceLabelKeyByKind[reference.kind])}
                </AppText>
            </View>
        </GuardedPressable>
    );
};
