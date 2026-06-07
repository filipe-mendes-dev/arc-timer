import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        intro: {
            gap: 6,
        },
        title: {
            flexShrink: 1,
        },
        description: {
            flexShrink: 1,
        },
        actions: {
            gap: theme.layout.grid.gap,
        },
        activeActions: {
            flexDirection: 'row',
            gap: theme.layout.grid.gap,
        },
        activeActionItem: {
            flex: 1,
            minWidth: 0,
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
        errorBanner: {
            marginTop: theme.layout.listItem.gap,
        },
    }),
);
