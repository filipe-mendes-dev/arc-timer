import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: theme.layout.screen.padding,
        },
        emptyTitle: {
            textAlign: 'center',
        },
        headerContainer: {
            gap: 8,
        },
        headerTitle: {
            flexShrink: 1,
        },
        headerDateRow: {
            gap: 6,
        },
        headerDateItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        overviewRow: {
            gap: 12,
        },
        overviewMetricsRow: {
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 12,
        },
        metricCard: {
            flex: 1,
            justifyContent: 'space-between',
            minWidth: 0,
            gap: 6,
        },
        metricLabelSlot: {
            flexGrow: 1,
        },
        metricLabel: {
            flexShrink: 1,
        },
        exerciseBody: {
            gap: 10,
        },
        exerciseName: {
            flexShrink: 1,
        },
        exerciseMetaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        setsContainer: {
            gap: 10,
        },
        setRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        setIndexBubble: {
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.soft,
        },
        setIndexText: {
            fontSize: 12,
            fontWeight: '700',
            color: theme.palette.accent.primary,
        },
        setTexts: {
            flex: 1,
            minWidth: 0,
        },
        notes: {
            flexShrink: 1,
        },
        actionsContainer: {
            gap: 8,
        },
        linkHint: {
            flexShrink: 1,
        },
    }),
);
