import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { Watermark } from '@src/components/ui/Watermark/Watermark';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymSessionHeaderBackground.styles';

export const GymSessionHeaderBackground = () => {
    const { theme } = useTheme();
    const st = useStyles();

    return (
        <View
            style={st.root}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
            <LinearGradient
                colors={[theme.palette.accent.headerStart, theme.palette.background.primary]}
                style={st.gradient}
            />
            <Watermark
                watermarkMode="subtle"
                watermarkSize={150}
                watermarkPosition="top-right"
                offsetX={0.25}
                style={st.watermark}
            />
        </View>
    );
};
