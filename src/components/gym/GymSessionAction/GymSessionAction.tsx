import type { Ref } from 'react';
import { View } from 'react-native';

import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppIcon, type IconId } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymSessionAction.styles';

interface GymSessionActionProps {
    icon: IconId;
    label: string;
    onPress: () => void;
    isPrimary?: boolean;
    isWide?: boolean;
    isDisabled?: boolean;
    isDestructive?: boolean;
    anchorRef?: Ref<View>;
}

export const GymSessionAction = ({
    icon,
    label,
    onPress,
    isPrimary = false,
    isWide = isPrimary,
    isDisabled = false,
    isDestructive = false,
    anchorRef,
}: GymSessionActionProps) => {
    const { theme } = useTheme();
    const st = useStyles();
    let iconColor = theme.palette.accent.foreground;
    if (isPrimary) iconColor = theme.palette.accent.darkInk;
    if (isDestructive && !isDisabled) iconColor = theme.palette.icon.error;

    return (
        <View style={[st.root, isWide && st.wideRoot]}>
            <View style={st.buttonSlot}>
                <View ref={anchorRef} collapsable={false}>
                    <CircleIconButton
                        accessibilityLabel={label}
                        disabled={isDisabled}
                        onPress={onPress}
                        variant={isPrimary ? 'primary' : 'secondary'}
                        size={isPrimary ? 72 : 52}
                        style={isPrimary ? st.primaryButton : st.secondaryButton}
                    >
                        <AppIcon id={icon} size={isPrimary ? 32 : 22} color={iconColor} />
                    </CircleIconButton>
                </View>
            </View>
            <AppText
                variant="caption"
                weight="semibold"
                style={[st.label, isPrimary && st.primaryLabel]}
                numberOfLines={2}
            >
                {label}
            </AppText>
        </View>
    );
};
