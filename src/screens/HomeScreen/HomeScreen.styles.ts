import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        headerContainer: {
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
            paddingTop: 1,
        },
        headerTextContainer: {
            width: '100%',
            gap: 4,
        },
        heading: {},
        subheading: {},
        gridContainer: { gap: 14 },

        grid: {
            flexDirection: 'row',
            gap: 14,
        },
        gridItem: {
            flex: 1,
        },

        list: {
            flex: 1,
            width: '100%',
        },

        listContent: {
            gap: theme.layout.listItem.gap,
            paddingBottom: theme.insets.bottom,
        },

        activeSessionActions: {
            flexDirection: 'row',
            gap: theme.layout.grid.gap,
        },
        activeSessionActionItem: {
            flex: 1,
            minWidth: 0,
        },
        recentSessionsButton: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: 6,
            paddingHorizontal: 0,
            paddingVertical: 6,
        },
        recentSessionsButtonText: {
            color: theme.palette.text.secondary,
        },
    }),
);
