import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        item: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 12,
        },
        leadingBubble: {
            width: 28,
            height: 28,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.soft,
        },
        indexText: {
            fontSize: 13,
            fontWeight: '700',
            color: theme.palette.accent.primary,
        },
        content: {
            flex: 1,
            minWidth: 0,
            gap: 4,
        },
    }),
);
