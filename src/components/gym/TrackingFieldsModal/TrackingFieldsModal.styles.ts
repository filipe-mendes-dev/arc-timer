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
            gap: 12,
        },
        modalText: {
            gap: 6,
        },
        modalActions: {
            gap: 6,
        },
        errorbanner: {
            paddingBottom: theme.layout.modal.padding,
        },
        cancelButton: {
            marginBottom: -6,
        },
    }),
);
