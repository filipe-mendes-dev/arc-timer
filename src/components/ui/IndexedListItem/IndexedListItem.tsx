import { View } from 'react-native';

import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import type { IconId } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './IndexedListItem.styles';

interface IndexedListItemProps {
    iconName?: IconId;
    index?: number;
    mainContent: string;
    secondaryContent?: string;
}

export const IndexedListItem = ({
    iconName,
    index,
    mainContent,
    secondaryContent,
}: IndexedListItemProps) => {
    const { theme } = useTheme();
    const st = useStyles();
    const hasIcon = iconName !== undefined;
    const hasIndex = index !== undefined;

    return (
        <View style={st.item}>
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
        </View>
    );
};
