import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useActionModalStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        container: {
            padding: theme.layout.modal.padding,
        },
        content: {
            backgroundColor: theme.palette.background.card,
            borderRadius: theme.layout.card.borderRadius,
            borderWidth: theme.layout.card.borderWidth,
            borderColor: theme.palette.border.subtle,
            padding: theme.layout.card.padding,
            gap: 12,
        },
        text: {
            gap: 6,
        },
        actions: {
            gap: 6,
        },
        errorCollapse: {
            paddingBottom: theme.layout.modal.padding,
        },
        secondaryButton: {
            marginBottom: -6,
        },
    }),
);
