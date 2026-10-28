import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useMetricCardStyles = createStyles(() =>
    StyleSheet.create({
        card: {
            flex: 1,
            minWidth: 0,
            justifyContent: 'center',
            gap: 2,
        },
        cardWide: {
            minWidth: 180,
            flex: 1.35,
        },
        label: {
            marginBottom: 2,
            flexShrink: 1,
        },
        labelRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        value: {
            fontWeight: '700',
        },
        valueNode: {
            minWidth: 0,
        },
        disabled: {
            opacity: 0.5,
        },
    }),
);
