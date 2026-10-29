import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles((theme) =>
    StyleSheet.create({
        root: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            width: '100%',
            gap: 8,
            paddingTop: 18,
            paddingHorizontal: theme.layout.screen.fullScreenHorizontalPadding,
        },
    }),
);
