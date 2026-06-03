import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        root: {
            paddingHorizontal: 20,
        },
        exerciseList: {
            gap: theme.layout.listItem.gap,
        },
    }),
);
