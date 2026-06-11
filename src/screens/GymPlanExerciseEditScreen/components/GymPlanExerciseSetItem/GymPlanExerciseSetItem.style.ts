import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        setLine: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: theme.layout.card.borderRadius,
            borderWidth: 1,
            borderColor: theme.palette.background.card,
            backgroundColor: theme.palette.background.card,
            overflow: 'hidden',
        },
        setLineSelected: {
            borderColor: theme.palette.accent.primary,
            backgroundColor: theme.palette.accent.surface,
        },
        setLineMain: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingLeft: 14,
            gap: 12,
        },
        setIndexBubble: {
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.soft,
        },
        setIndexBubbleSelectMode: {
            backgroundColor: theme.palette.background.card,
        },
        setIndexBubbleSelected: {
            backgroundColor: theme.palette.accent.surface,
        },
        setIndexText: {
            fontSize: 12,
            fontWeight: '700',
            color: theme.palette.accent.primary,
        },
        setLineText: {
            flex: 1,
            minWidth: 0,
            gap: 2,
        },
        setTitle: {
            fontWeight: '700',
            color: theme.palette.text.primary,
        },
        setDetailsText: {
            flexShrink: 1,
        },
        iconAction: {
            width: 48,
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'center',
        },
    }),
);
