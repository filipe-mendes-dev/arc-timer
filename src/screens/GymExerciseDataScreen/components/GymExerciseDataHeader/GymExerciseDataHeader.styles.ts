import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        root: {
            width: '100%',
            gap: 14,
            paddingHorizontal: theme.layout.screen.fullScreenHorizontalPadding,
            paddingBottom: theme.layout.card.padding,
        },
        headerTopRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            columnGap: 12,
        },
        titleBlock: {
            flexShrink: 1,
            maxWidth: '100%',
            minWidth: 0,
            gap: 10,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            minWidth: 0,
        },
        headerTitle: {
            flexShrink: 1,
            minWidth: 0,
            color: theme.palette.text.primary,
            fontWeight: '700',
            letterSpacing: 0.2,
        },
        detailsLink: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 3,
            flexShrink: 0,
        },
        detailsLabel: {
            color: theme.palette.accent.primaryStrong,
            fontWeight: '500',
        },
        metadataRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
        },
        durationContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        durationIcon: {
            marginRight: 4,
        },
        durationText: {
            color: theme.palette.text.primary,
            fontWeight: '600',
            fontVariant: ['tabular-nums'],
            textAlign: 'left',
        },
        metricsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
        },
        metricItem: {
            flexDirection: 'row',
            alignItems: 'center',
            minWidth: 0,
        },
        metricIcon: {
            marginRight: 5,
        },
        metricLabel: {
            color: theme.palette.text.muted,
            fontWeight: '500',
        },
        metricDivider: {
            width: 1,
            height: 14,
            backgroundColor: theme.palette.border.subtle,
            borderColor: theme.palette.border.subtle,
        },
        historyRow: {
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 16,
            padding: 16,
            borderRadius: 14,
            backgroundColor: theme.palette.background.card,
        },
        historyDivider: {
            width: StyleSheet.hairlineWidth,
            backgroundColor: theme.palette.border.subtle,
        },
    }),
);
