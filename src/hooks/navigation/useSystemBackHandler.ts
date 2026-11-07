import { useFocusEffect, useIsFocused, useNavigation, usePreventRemove } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';

export interface UseSystemBackHandlerArgs {
    onSystemBack: () => boolean;
    isGestureBackDisabled?: boolean;
}

export const useSystemBackHandler = ({
    onSystemBack,
    isGestureBackDisabled = true,
}: UseSystemBackHandlerArgs): { allowNextBack: () => void } => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [isBackPreventionEnabled, setBackPreventionEnabled] = useState(true);

    const disablePrevention = usePreventRemove(
        isFocused && isBackPreventionEnabled,
        ({ data, repeat }) => {
            const actionType = data.action.type;
            const isBackAction = actionType === 'POP' || actionType === 'GO_BACK';
            if (isBackAction && onSystemBack()) return;

            setBackPreventionEnabled(false);
            repeat();
        },
    );

    const allowNextBack = useCallback(() => {
        setBackPreventionEnabled(false);
        disablePrevention();
    }, [disablePrevention]);

    useLayoutEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isGestureBackDisabled,
        });
    }, [navigation, isGestureBackDisabled]);

    useFocusEffect(
        useCallback(() => {
            setBackPreventionEnabled(true);
        }, []),
    );

    useFocusEffect(
        useCallback(() => {
            if (Platform.OS !== 'android') return;

            const subscription = BackHandler.addEventListener(
                'hardwareBackPress',
                () => onSystemBack(),
            );

            return () => subscription.remove();
        }, [onSystemBack]),
    );

    return { allowNextBack };
};
