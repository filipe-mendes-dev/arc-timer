import React, { type ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

interface ScreenHeaderBarProps {
    children: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

const useStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        safe: {
            backgroundColor: theme.palette.background.primary,
        },
        content: {
            gap: theme.layout.grid.gap,
            paddingHorizontal: theme.layout.screen.fullScreenHorizontalPadding,
            paddingTop: theme.layout.screen.paddingVertical,
        },
    }),
);

export const ScreenHeaderBar = ({
    children,
    containerStyle,
}: ScreenHeaderBarProps) => {
    const st = useStyles();

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={st.safe}>
            <View style={[st.content, containerStyle]}>{children}</View>
        </SafeAreaView>
    );
};
