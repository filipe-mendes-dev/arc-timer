import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useStatisticsPeriodControlStyles = createStyles(() =>
    StyleSheet.create({
        control: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            flexShrink: 1,
            minWidth: 0,
            minHeight: 44,
            gap: 6,
            paddingVertical: 6,
        },
        label: { flexShrink: 1 },
    }),
);
