import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useSearchFieldStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            paddingRight: 6,
            paddingLeft: 16,
            backgroundColor: theme.palette.background.card,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
        },

        containerFullWidth: {
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
        },

        iconLeft: {
            marginRight: 6,
        },

        input: {
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 0,
            color: theme.palette.text.primary,
            backgroundColor: 'transparent',
        },

        clearHitbox: {
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            marginLeft: 4,
        },

        filterButton: {
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            marginRight: -6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.palette.border.subtle,
            backgroundColor: theme.palette.accent.primary,
        },

        filterBadge: {
            position: 'absolute',
            top: -3,
            right: -3,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            borderRadius: 999,
            backgroundColor: theme.palette.button.danger,
            borderWidth: 1,
            borderColor: theme.palette.background.card,
        },

        filterBadgeText: {
            color: theme.palette.button.text.danger,
            fontSize: 10,
            lineHeight: 12,
        },

        filterModal: { maxHeight: '100%' },
        filterScroll: { flexShrink: 1, flexGrow: 0 },
        filterSections: {
            gap: 18,
        },

        filterSection: {
            gap: 10,
        },
    }),
);
