import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: theme.palette.background.primary,
        },
        emptyBody: {
            flex: 1,
            paddingHorizontal: theme.layout.screen.paddingHorizontal,
            paddingVertical: theme.layout.screen.paddingVertical,
        },
        list: {
            flex: 1,
        },
        listContent: {
            flexGrow: 1,
        },
        errorBanner: {
            paddingHorizontal: theme.layout.screen.paddingHorizontal,
        },
    }),
);
