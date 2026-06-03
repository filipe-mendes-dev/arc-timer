import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        root: {
            width: '100%',
            gap: 12,
            paddingHorizontal: theme.layout.screen.fullScreenHorizontalPadding,
            paddingBottom: theme.layout.card.padding,
        },
        headerTopRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 10,
        },
        titleBlock: {
            flex: 1,
            minWidth: 0,
            gap: 6,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            minWidth: 0,
        },
        headerTitle: {
            flex: 1,
            minWidth: 0,
            color: theme.palette.text.primary,
            fontWeight: '700',
            letterSpacing: 0.2,
        },
        progressContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        progressIcon: {
            marginRight: 4,
        },
        progressText: {
            color: theme.palette.text.primary,
            fontWeight: '700',
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
    }),
);
