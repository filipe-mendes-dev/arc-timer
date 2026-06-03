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
