import React, {
    forwardRef,
    useImperativeHandle,
    type ReactNode,
    type RefObject,
} from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
    type StyleProp,
    type View as ReactNativeView,
    type ViewStyle,
} from 'react-native';

import { TopBar } from '@src/components/navigation/TopBar/TopBar';
import type {
    TopBarDirectAction,
    TopBarLeftMode,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import { ScreenShell } from '../ScreenShell';
import { useMainContainerStyles } from './MainContainer.styles';
import { MainContainerScrollProvider } from './MainContainerScrollContext';
import { useMainContainerScroll } from './useMainContainerScroll';

type MainContainerProps = {
    title?: string;
    children: ReactNode;
    scroll?: boolean;
    gap?: number;
    hasCustomHeader?: boolean;
    noPadding?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    topBarOptions?: readonly TopBarOption[];
    topBarLeftMode?: TopBarLeftMode;
    topBarLeftAction?: TopBarDirectAction;
    topBarRightAction?: TopBarDirectAction;
};

export interface MainContainerHandle {
    scrollTargetIntoView: (
        targetRef: RefObject<ReactNativeView | null>,
        viewportRatio?: number,
    ) => void;
}

export const MainContainer = forwardRef<
    MainContainerHandle,
    MainContainerProps
>(
    (
        {
            title,
            children,
            scroll = true,
            gap = 8,
            hasCustomHeader = false,
            noPadding = false,
            containerStyle,
            topBarOptions,
            topBarLeftMode,
            topBarLeftAction,
            topBarRightAction,
        },
        ref,
    ) => {
        const st = useMainContainerStyles({ gap, noPadding });
        const {
            monitorScroll,
            scrollContextValue,
            scrollTargetIntoView,
            scrollViewRef,
            viewportRef,
        } = useMainContainerScroll();

        useImperativeHandle(
            ref,
            () => ({
                scrollTargetIntoView,
            }),
            [scrollTargetIntoView],
        );

        const content = scroll ? (
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[st.content, containerStyle]}
                keyboardShouldPersistTaps="handled"
                onScroll={monitorScroll}
                scrollEventThrottle={16}
            >
                {children}
            </ScrollView>
        ) : (
            <View style={[st.content, containerStyle]}>{children}</View>
        );

        return (
            <ScreenShell hasTopBar={!!title || hasCustomHeader}>
                {title ? (
                    <TopBar
                        title={title}
                        leftMode={topBarLeftMode}
                        leftAction={topBarLeftAction}
                        options={topBarOptions}
                        rightAction={topBarRightAction}
                    />
                ) : null}

                <MainContainerScrollProvider value={scrollContextValue}>
                    <KeyboardAvoidingView
                        style={st.kav}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View ref={viewportRef} style={st.viewport}>
                            {content}
                        </View>
                    </KeyboardAvoidingView>
                </MainContainerScrollProvider>
            </ScreenShell>
        );
    },
);

MainContainer.displayName = 'MainContainer';
