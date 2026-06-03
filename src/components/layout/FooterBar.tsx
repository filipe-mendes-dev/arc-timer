import React, { type ReactNode } from 'react';
import {
    Platform,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from '@src/theme/createStyles';

type FooterBarProps = {
    children: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
};

const PADDING_BOTTOM = 12;

const useStyles = createStyles((theme) => ({
    safe: {
        backgroundColor: theme.palette.background.primary,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: theme.layout.footer.padding,
        paddingTop: 10,

        // base is 16 : 0 the added is literal bottom padding
        paddingBottom:
            Platform.OS === 'android'
                ? 16 + PADDING_BOTTOM
                : 0 + PADDING_BOTTOM,
    },
}));

export const FooterBar = ({ children, containerStyle }: FooterBarProps) => {
    const st = useStyles();

    return (
        <SafeAreaView edges={['bottom']} style={st.safe}>
            <View style={[st.row, containerStyle]}>{children}</View>
        </SafeAreaView>
    );
};
