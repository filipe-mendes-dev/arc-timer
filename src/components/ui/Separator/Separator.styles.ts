import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

interface SeparatorStyleProps {
    color?: string;
    height?: number;
    spacing: 'none' | 'small' | 'medium' | 'large';
}

const getSpacing = (
    theme: AppTheme,
    spacing: SeparatorStyleProps['spacing'],
): number => {
    switch (spacing) {
        case 'large':
            return theme.layout.section.gap;
        case 'medium':
            return theme.layout.grid.gap;
        case 'small':
            return theme.layout.listItem.gap;
        case 'none':
        default:
            return 0;
    }
};

export const useStyles = createStyles(
    (theme: AppTheme, props: SeparatorStyleProps) => {
        const verticalSpacing = getSpacing(theme, props.spacing);

        return StyleSheet.create({
            root: {
                height: props.height ?? StyleSheet.hairlineWidth,
                marginVertical: verticalSpacing,
                backgroundColor: props.color ?? theme.palette.border.subtle,
            },
        });
    },
);
