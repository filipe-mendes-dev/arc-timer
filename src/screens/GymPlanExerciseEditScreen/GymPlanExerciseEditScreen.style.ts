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
        },
        setList: {
            gap: theme.layout.listItem.gap,
        },
    }),
);
