import React from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon, type IconId } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useDrawerItemRowStyles } from './DrawerItemRow.styles';

export type DrawerItemRowProps = {
    label: string;
    focused: boolean;
    onPress: () => void;

    iconId?: IconId;

    activeTintColor: string;
    inactiveTintColor: string;
    activeBgColor: string;
};

export const DrawerItemRow = ({
    label,
    focused,
    onPress,
    iconId,
    activeTintColor,
    inactiveTintColor,
}: DrawerItemRowProps) => {
    const st = useDrawerItemRowStyles();

    const tint = focused ? activeTintColor : inactiveTintColor;

    return (
        <Pressable
            onPress={onPress}
            style={[
                st.pressableBase,
                focused ? st.pressableActive : st.pressableInactive,
            ]}
        >
            <View style={st.contentRow}>
                {iconId ? <AppIcon id={iconId} size={18} color={tint} /> : null}

                <AppText
                    variant="subtitle"
                    numberOfLines={1}
                    style={focused ? st.labelActive : st.labelInactive}
                >
                    {label}
                </AppText>
            </View>
        </Pressable>
    );
};

export default DrawerItemRow;
