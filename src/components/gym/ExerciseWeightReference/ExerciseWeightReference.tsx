import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MetricCard } from '@src/components/ui/MetricCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { ExerciseDefinitionSetMetric } from '@src/core/entities/exerciseDefinition.interfaces';
import { gramsToKg } from '@src/helpers/gymExerciseRecord.helpers';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './ExerciseWeightReference.styles';

interface ExerciseWeightReferenceProps {
    metric: ExerciseDefinitionSetMetric;
    variant: 'lastSession' | 'weightPr';
}

export const ExerciseWeightReference = ({
    metric,
    variant,
}: ExerciseWeightReferenceProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const isPersonalBest = variant === 'weightPr';

    return (
        <MetricCard
            label={t(`gymExerciseData.history.${variant}`)}
            labelIcon={isPersonalBest ? 'trophy' : 'history'}
            labelIconColor={isPersonalBest ? theme.palette.accent.primaryStrong : undefined}
            value={
                <View style={st.valueRow}>
                    <AppText variant="title1" weight="semibold" style={st.weight}>
                        {gramsToKg(metric.value)}
                        <AppText variant="bodySmall"> {t('common.units.kg')}</AppText>
                    </AppText>
                    {metric.reps !== undefined && (
                        <AppText variant="bodySmall" tone="muted">
                            {t('gymExerciseData.history.reps', { count: metric.reps })}
                        </AppText>
                    )}
                </View>
            }
        />
    );
};
