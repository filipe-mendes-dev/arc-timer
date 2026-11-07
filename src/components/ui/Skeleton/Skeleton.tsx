import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
    cancelAnimation,
    ReduceMotion,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useSkeletonStyles } from './Skeleton.styles';

interface SkeletonProps {
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
}

export const Skeleton = ({ style, accessibilityLabel }: SkeletonProps) => {
    const st = useSkeletonStyles();
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.5, { duration: 900 }),
            -1,
            true,
            undefined,
            ReduceMotion.System,
        );
        return () => cancelAnimation(opacity);
    }, [opacity]);

    const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return (
        <Animated.View
            style={[st.base, style, pulse]}
            accessible={!!accessibilityLabel}
            accessibilityRole="progressbar"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ busy: true }}
        />
    );
};
