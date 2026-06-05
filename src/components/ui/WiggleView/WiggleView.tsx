import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface WiggleViewProps {
    children: ReactNode;
    index?: number;
    isWiggling?: boolean;
    style?: StyleProp<ViewStyle>;
}

const SHAKE_DISTANCE = 1;
const SHAKE_STEP_MS = 300;
const PAUSE_BETWEEN_SHAKES_MS = 500;
const INITIAL_DELAY_STAGGER_MS = 90;

export const WiggleView = ({
    children,
    index = 0,
    isWiggling = false,
    style,
}: WiggleViewProps) => {
    const wiggleValue = useSharedValue<number>(0);

    const wiggleAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: wiggleValue.value }],
    }));

    useEffect(() => {
        if (!isWiggling) {
            cancelAnimation(wiggleValue);
            wiggleValue.value = 0;
            return;
        }

        const initialDelayMs = index * INITIAL_DELAY_STAGGER_MS;
        const easing = Easing.inOut(Easing.quad);

        wiggleValue.value = withDelay(
            initialDelayMs,
            withRepeat(
                withSequence(
                    withTiming(SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(-SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(SHAKE_DISTANCE, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withTiming(0, {
                        duration: SHAKE_STEP_MS,
                        easing,
                    }),
                    withDelay(
                        PAUSE_BETWEEN_SHAKES_MS,
                        withTiming(0, {
                            duration: 0,
                            easing,
                        }),
                    ),
                ),
                -1,
            ),
        );
    }, [index, isWiggling, wiggleValue]);

    return (
        <Animated.View style={[style, isWiggling && wiggleAnimatedStyle]}>
            {children}
        </Animated.View>
    );
};
