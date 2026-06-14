import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        content: {
            gap: 16,
        },
        formCard: {
            gap: 14,
            padding: theme.layout.card.padding,
            borderRadius: theme.layout.card.borderRadius,
            borderWidth: theme.layout.card.borderWidth,
            borderColor: theme.palette.border.subtle,
            backgroundColor: theme.palette.background.card,
        },
        textContainer: {
            gap: 6,
        },
        actions: {
            gap: 12,
        },
        errorBanner: {
            paddingBottom: 12,
        },
    }),
);
