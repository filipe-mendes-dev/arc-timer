import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useAttendanceCalendarStyles = createStyles((theme) =>
    StyleSheet.create({
        grid: { flexDirection: 'row', flexWrap: 'wrap' },
        cell: { width: '14.285714%', padding: 2 },
        day: {
            minHeight: 44,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
        },
        trained: { backgroundColor: theme.palette.accent.soft },
        selected: { backgroundColor: theme.palette.accent.primary },
        selectedText: { color: theme.palette.text.inverted },
        disabled: { opacity: 0.35 },
        weekday: { textAlign: 'center', paddingVertical: 8 },
        dot: {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.palette.accent.primaryStrong,
        },
        selectedDot: { backgroundColor: theme.palette.text.inverted },
    }),
);
