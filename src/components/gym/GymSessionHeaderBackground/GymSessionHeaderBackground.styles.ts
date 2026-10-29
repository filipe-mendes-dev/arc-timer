import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles((theme) =>
    StyleSheet.create({
        root: {
            ...StyleSheet.absoluteFill,
            overflow: 'hidden',
        },
        gradient: StyleSheet.absoluteFill,
        watermark: {
            top: theme.layout.screen.paddingVertical,
            opacity: 0.65,
        },
    }),
);
