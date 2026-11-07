import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
export const useMonthControlStyles = createStyles(() =>
    StyleSheet.create({
        modal: { maxHeight: '100%' },
        options: { flexShrink: 1, flexGrow: 0 },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
        },
        navigation: {
            flexDirection: 'row',
            alignItems: 'center',
            flexShrink: 0,
        },
        arrow: {
            width: 44,
            minHeight: 44,
        },
        nextIcon: { transform: [{ rotate: '180deg' }] },
        label: { flex: 1, minWidth: 0, flexShrink: 1 },
    }),
);
