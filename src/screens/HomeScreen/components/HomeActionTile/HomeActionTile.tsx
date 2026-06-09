import { useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { AppText } from '@src/components/ui/Typography/AppText';
import { AppIcon, type IconId } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';
import { Watermark } from '@src/components/ui/Watermark/Watermark';
import { useStyles } from './HomeActionTile.styles';

export interface HomeActionTileProps {
    title: string;
    subtitle?: string;
    icon: IconId;
    variant?: 'primary' | 'secondary';
    onPress: () => void;
}

export const HomeActionTile = ({
    title,
    subtitle,
    icon,
    variant = 'secondary',
    onPress,
}: HomeActionTileProps) => {
    const { theme } = useTheme();
    const st = useStyles({ variant });
    const [tileHeight, setTileHeight] = useState<number | null>(null);
    let iconSize = 22;
    let iconColor = theme.palette.text.primary;
    let titleVariant: 'body' | 'title3' = 'body';

    if (variant === 'primary') {
        iconSize = 26;
        iconColor = theme.palette.text.inverted;
        titleVariant = 'title3';
    }

    const handleLayout = (event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        setTileHeight(height);
    };

    // Watermark size is proportional to tile height
    const watermarkSize = tileHeight ? tileHeight * 0.9 : undefined;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [st.root, pressed && st.pressed]}
            onLayout={handleLayout}
        >
            {variant === 'secondary' && watermarkSize && (
                <Watermark
                    watermarkMode="medium"
                    watermarkSize={watermarkSize}
                    watermarkPosition="bottom-right"
                    offsetY={0.05}
                    offsetX={0.05}
                    sizeScale={0.9}
                />
            )}
            <AppIcon
                id={icon}
                size={iconSize}
                color={iconColor}
            />

            <View style={st.textBlock}>
                <AppText
                    variant={titleVariant}
                    style={st.title}
                >
                    {title}
                </AppText>

                {subtitle ? (
                    <AppText variant="bodySmall" style={st.subtitle}>
                        {subtitle}
                    </AppText>
                ) : null}
            </View>
        </Pressable>
    );
};
