import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        exerciseItem: {
            gap: 12,
        },
        exerciseSetsContainer: {
            gap: 8,
            paddingLeft: 16,
        },
        setRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        setStatusIcon: {
            marginTop: 1,
        },
        setSummary: {
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        setTitle: {
            flexShrink: 0,
            color: theme.palette.text.primary,
        },
        setDetails: {
            flex: 1,
            minWidth: 0,
        },
    }),
);
