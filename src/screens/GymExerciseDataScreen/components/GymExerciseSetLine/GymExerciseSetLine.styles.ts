import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        setLine: {
            flexDirection: 'row',
            alignItems: 'center',

            paddingHorizontal: theme.layout.screen.paddingHorizontal,

            backgroundColor: theme.palette.background.primary,
        },
        setLineCompleted: {
            backgroundColor: theme.palette.background.card,
        },
        setLineSelected: {
            backgroundColor: theme.palette.accent.surface,
        },
        setLineMain: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 18,
            gap: 16,
        },
        setIndexBubble: {
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.card,
        },
        setIndexBubbleCompleted: {
            backgroundColor: theme.palette.accent.soft,
        },
        setIndexBubbleSelection: {
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        completedSelectionState: {
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
        },
        completedSelectionPill: {
            maxWidth: 96,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.palette.accent.primary,
            backgroundColor: theme.palette.accent.soft,
        },
        completedSelectionPillText: {
            color: theme.palette.accent.primary,
            fontWeight: '700',
        },
        setIndexText: {
            fontSize: 12,
            fontWeight: '700',
            color: theme.palette.accent.primary,
        },
        setLineText: {
            flex: 1,
            minWidth: 0,
        },
        setDetailsText: {
            flexShrink: 1,
            fontWeight: '600',
        },
        actionGroup: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        iconAction: {
            width: 36,
            alignItems: 'center',
            justifyContent: 'center',
        },
    }),
);
