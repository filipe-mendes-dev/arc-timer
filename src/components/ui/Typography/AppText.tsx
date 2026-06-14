import React, { type FC, useMemo } from 'react';
import type { StyleProp } from 'react-native';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@src/theme/ThemeProvider';
import { createTypography, type TextVariant } from '@src/theme/typography';

export type TextTone =
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'inverted'
    | 'error'
    | 'success';

export type AppTextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

const fontWeightByWeight: Record<AppTextWeight, TextStyle['fontWeight']> = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

export interface AppTextProps extends TextProps {
    variant?: TextVariant;
    tone?: TextTone;
    weight?: AppTextWeight;
    align?: 'left' | 'center' | 'right';
    style?: StyleProp<TextStyle>;
    children: React.ReactNode;
}

export const AppText: FC<AppTextProps> = ({
    variant = 'body',
    tone = 'primary',
    weight,
    align,
    style,
    children,
    ...rest
}) => {
    const { theme } = useTheme();

    const typography = useMemo(() => createTypography(theme), [theme]);
    const variantStyle = typography[variant];

    const color = theme.palette.text[tone];

    const base: TextStyle = {
        color,
        textAlign: align,
    };
    const weightStyle: TextStyle | undefined = weight
        ? { fontWeight: fontWeightByWeight[weight] }
        : undefined;

    return (
        <Text {...rest} style={[variantStyle, base, weightStyle, style]}>
            {children}
        </Text>
    );
};
