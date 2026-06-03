import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        modalContainer: {
            padding: theme.layout.modal.padding,
        },
        modalContent: {
            backgroundColor: theme.palette.background.card,
            borderRadius: theme.layout.card.borderRadius,
            borderWidth: theme.layout.card.borderWidth,
            borderColor: theme.palette.border.subtle,
            padding: theme.layout.card.padding,
        },
        modalBody: {
            gap: 16,
        },
        modalText: {
            gap: 6,
        },
        fieldToggleGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },
        fieldToggle: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 999,
            borderWidth: theme.layout.card.borderWidth,
            borderColor: theme.palette.border.subtle,
            backgroundColor: theme.palette.background.primary,
        },
        fieldToggleSelected: {
            borderColor: theme.palette.accent.primary,
            backgroundColor: theme.palette.accent.surface,
        },
    }),
);
