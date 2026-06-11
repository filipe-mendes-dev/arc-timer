import type { ReactNode } from 'react';
import { View } from 'react-native';

import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';

import { useMetricCardStyles } from './MetricCard.styles';

interface MetricCardProps {
    label: string;
    value: ReactNode;
    disabled?: boolean;
    isWide?: boolean;
    numberOfLines?: number;
    onPress?: () => void;
}

const isTextValue = (value: ReactNode): value is string | number =>
    typeof value === 'string' || typeof value === 'number';

export const MetricCard = ({
    label,
    value,
    disabled = false,
    isWide = false,
    numberOfLines = 1,
    onPress,
}: MetricCardProps) => {
    const st = useMetricCardStyles();
    const cardStyle = [st.card, isWide && st.cardWide, disabled && st.disabled];
    const valueContent = isTextValue(value) ? (
        <AppText
            variant="bodySmall"
            style={st.value}
            numberOfLines={numberOfLines}
        >
            {value}
        </AppText>
    ) : (
        <View style={st.valueNode}>{value}</View>
    );

    if (onPress) {
        return (
            <GuardedPressable
                disabled={disabled}
                onPress={onPress}
                style={cardStyle}
            >
                <AppText variant="caption" tone="muted" style={st.label}>
                    {label}
                </AppText>
                {valueContent}
            </GuardedPressable>
        );
    }

    return (
        <View style={cardStyle}>
            <AppText variant="caption" tone="muted" style={st.label}>
                {label}
            </AppText>
            {valueContent}
        </View>
    );
};
