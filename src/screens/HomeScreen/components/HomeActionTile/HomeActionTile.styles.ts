import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useStyles = createStyles(
    (theme: AppTheme, { variant }: { variant: 'primary' | 'secondary' }) => {
        let rootBackgroundColor = theme.palette.background.card;
        let textColor = theme.palette.text.primary;
        let subtitleColor = theme.palette.text.secondary;

        if (variant === 'primary') {
            rootBackgroundColor = theme.palette.accent.primary;
            textColor = theme.palette.text.inverted;
            subtitleColor = theme.palette.text.inverted;
        }

        return StyleSheet.create({
            root: {
                borderRadius: theme.layout.tile.borderRadius,
                padding: 16,
                backgroundColor: rootBackgroundColor,
                justifyContent: 'space-between',
                gap: 24,
                position: 'relative',
                overflow: 'hidden',
            },

            pressed: {
                opacity: 0.8,
            },

            textBlock: {
                gap: 4,
            },

            title: {
                color: textColor,
            },

            subtitle: {
                color: subtitleColor,
            },
        });
    },
);
