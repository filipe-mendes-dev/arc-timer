import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        center: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
        },
        errorText: {
            marginBottom: 12,
        },
        errorButton: {
            alignSelf: 'center',
        },
        overviewRow: {
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 14,
        },
        metricCard: {
            flex: 1,
            justifyContent: 'center',
        },
        metricCardWide: {
            flex: 1.2,
            justifyContent: 'center',
        },
        metricLabel: {
            marginBottom: 2,
        },
        metricValue: {
            fontWeight: '700',
        },
        errorBanner: {
            marginTop: 8,
        },
        notesText: {
            flexShrink: 1,
            lineHeight: 20,
        },
        favoriteToggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        favoriteLabel: {
            color: theme.palette.text.secondary,
        },
        favoriteLabelActive: {
            color: theme.palette.accent.primary,
        },
        hint: {
            marginTop: 4,
            flexShrink: 1,
        },
        exportContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            gap: 10,
        },
        exportButton: {
            opacity: 0.7,
        },
        exportText: {
            color: theme.palette.text.muted,
            borderBottomColor: theme.palette.text.muted,
            borderBottomWidth: 1,
        },
    }),
);
