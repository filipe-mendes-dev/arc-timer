import { useTranslation } from 'react-i18next';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useStatisticsPeriodControlStyles } from './StatisticsPeriodControl.styles';

interface StatisticsPeriodControlProps {
    label: string;
    accessibilityLabel?: string;
    onPress: () => void;
}

export const StatisticsPeriodControl = ({
    label,
    accessibilityLabel,
    onPress,
}: StatisticsPeriodControlProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStatisticsPeriodControlStyles();
    return (
        <GuardedPressable
            style={st.control}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityLabel ?? t('statistics.choosePeriod')}: ${label}`}
        >
            <AppIcon
                id="calendar"
                size={18}
                color={theme.palette.text.primary}
            />
            <AppText variant="bodySmall" style={st.label}>
                {label}
            </AppText>
        </GuardedPressable>
    );
};
