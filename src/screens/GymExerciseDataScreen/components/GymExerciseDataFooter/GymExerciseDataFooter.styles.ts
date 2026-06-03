import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        root: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingHorizontal: theme.layout.screen.fullScreenHorizontalPadding,
        },
        actionItem: {
            width: 76,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
        },
        primaryActionItem: {
            width: 118,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
        },
        actionLabel: {
            color: theme.palette.text.secondary,
            fontWeight: '700',
            textAlign: 'center',
        },
    }),
);
