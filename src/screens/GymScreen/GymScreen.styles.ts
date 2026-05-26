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
        modalContainer: {
            padding: theme.layout.modal.padding,
        },
        modalContent: {
            backgroundColor: theme.palette.background.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            padding: 16,
            shadowColor: theme.palette.background.primary,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
        modalBody: {
            gap: 14,
        },
        modalTextContainer: {
            padding: 4,
            gap: 6,
        },
        modalTitle: {
            flexShrink: 1,
        },
        modalMessage: {
            flexShrink: 1,
        },
        modalActions: {
            gap: 10,
        },
        cancelButton: {
            paddingVertical: 10,
            alignItems: 'center',
            marginBottom: -4,
        },
    }),
);
