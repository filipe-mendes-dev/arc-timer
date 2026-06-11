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
            gap: 12,
        },
        errorBanner: {
            paddingTop: theme.layout.listItem.gap,
        },
        notesContent: {
            paddingTop: theme.layout.mainContainer.gap,
        },
    }),
);
