import { View } from 'react-native';

import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import type { IconId } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './IndexedListItem.styles';

interface IndexedListItemProps {
    iconName?: IconId;
    index?: number;
    mainContent: string;
    onPress?: () => void;
    secondaryContent?: string;
}

export const IndexedListItem = ({
    iconName,
    index,
    mainContent,
    onPress,
    secondaryContent,
}: IndexedListItemProps) => {
    const { theme } = useTheme();
    const st = useStyles();
    const hasIcon = iconName !== undefined;
    const hasIndex = index !== undefined;
    const content = (
        <>
            {(hasIcon || hasIndex) && (
                <View style={st.leadingBubble}>
                    {hasIcon && (
                        <AppIcon
                            id={iconName}
                            size={20}
                            color={theme.palette.accent.primary}
                        />
                    )}

                    {!hasIcon && hasIndex && (
                        <AppText variant="caption" style={st.indexText}>
                            {index + 1}
                        </AppText>
                    )}
                </View>
            )}

            <View style={st.content}>
                <AppText variant="bodySmall" tone="primary" numberOfLines={1}>
                    {mainContent}
                </AppText>

                {secondaryContent !== undefined && (
                    <AppText variant="caption" tone="muted" numberOfLines={1}>
                        {secondaryContent}
                    </AppText>
                )}
            </View>
        </>
    );

    if (onPress) {
        return (
            <GuardedPressable
                accessibilityRole="button"
                onPress={onPress}
                style={st.item}
            >
                {content}
            </GuardedPressable>
        );
    }

    return (
        <View style={st.item}>
            {content}
        </View>
    );
};
