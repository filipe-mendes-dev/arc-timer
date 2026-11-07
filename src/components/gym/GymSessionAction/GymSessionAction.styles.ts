import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles((theme) =>
    StyleSheet.create({
        root: {
            flex: 1,
            minWidth: 0,
            alignItems: 'center',
            gap: 9,
        },
        wideRoot: {
            flex: 1.5,
        },
        buttonSlot: {
            height: 72,
            alignItems: 'center',
            justifyContent: 'center',
        },
        primaryButton: {
            shadowOpacity: 0,
            elevation: 0,
        },
        secondaryButton: {
            backgroundColor: theme.palette.accent.tintedSurface,
            borderColor: theme.palette.accent.tintedBorder,
            borderWidth: 1,
        },
        label: {
            width: '100%',
            minHeight: 34,
            lineHeight: 17,
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
        primaryLabel: {
            color: theme.palette.accent.foreground,
        },
    }),
);
