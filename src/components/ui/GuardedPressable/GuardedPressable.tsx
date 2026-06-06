import React, { useCallback, useRef } from 'react';
import {
    Pressable,
    StyleSheet,
    type PressableProps,
    type PressableStateCallbackType,
    type StyleProp,
    type View,
    type ViewStyle,
} from 'react-native';

export interface GuardedPressableProps extends PressableProps {
    cooldownMs?: number;
    isPressedFeedbackDisabled?: boolean;
    preventDoublePress?: boolean;
}

export const GuardedPressable = React.forwardRef<View, GuardedPressableProps>(
    (
        {
            cooldownMs = 300,
            isPressedFeedbackDisabled = false,
            preventDoublePress = true,
            onPress,
            disabled,
            style,
            ...props
        },
        ref,
    ) => {
        const lockRef = useRef(false);

        const handlePress = useCallback(
            async (
                ...args: Parameters<NonNullable<PressableProps['onPress']>>
            ) => {
                if (!onPress) return;
                if (disabled) return;

                // Guard disabled → behave like normal Pressable
                if (!preventDoublePress) {
                    onPress(...args);
                    return;
                }

                if (lockRef.current) return;

                lockRef.current = true;

                try {
                    await onPress(...args);
                } finally {
                    setTimeout(() => {
                        lockRef.current = false;
                    }, cooldownMs);
                }
            },
            [onPress, disabled, cooldownMs, preventDoublePress],
        );

        const getStyle = useCallback(
            (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
                if (typeof style === 'function') {
                    return style(state);
                }

                if (isPressedFeedbackDisabled || !state.pressed) {
                    return style;
                }

                return [style, st.pressed];
            },
            [isPressedFeedbackDisabled, style],
        );

        return (
            <Pressable
                {...props}
                ref={ref}
                disabled={disabled}
                onPress={handlePress}
                style={getStyle}
            />
        );
    },
);

GuardedPressable.displayName = 'GuardedPressable';

export default GuardedPressable;

const st = StyleSheet.create({
    pressed: {
        opacity: 0.8,
    },
});
