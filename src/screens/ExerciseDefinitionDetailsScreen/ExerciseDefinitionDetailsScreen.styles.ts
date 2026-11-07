import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useExerciseDefinitionDetailsScreenStyles = createStyles(
    (theme: AppTheme) =>
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
            overviewContainer: {
                flexDirection: 'row',
                gap: 14,
            },
            detailGrid: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 14,
                backgroundColor: theme.palette.background.card,
                borderRadius: theme.layout.card.borderRadius,
                padding: theme.layout.card.padding,
            },
            editableMetricValue: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                minWidth: 0,
            },
            flatList: {
                gap: 14,
            },
            editableMetricText: {
                flexShrink: 1,
                fontWeight: '700',
            },
            sessionRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: theme.layout.card.borderRadius,
                borderWidth: theme.layout.card.borderWidth,
                borderColor: theme.palette.border.subtle,
                backgroundColor: theme.palette.background.primary,
            },
            sessionInfo: {
                flex: 1,
                minWidth: 0,
                gap: 4,
            },
            sessionTitle: {
                color: theme.palette.text.primary,
                fontWeight: '700',
            },
            sessionDate: {
                color: theme.palette.text.secondary,
            },
            sessionDurationPill: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                backgroundColor: theme.palette.metaCard.datePill.background,
            },
            sessionDurationText: {
                color: theme.palette.metaCard.datePill.icon,
            },
            availabilityModalOptions: {
                gap: 8,
            },
        }),
);
