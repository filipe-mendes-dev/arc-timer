import React from 'react';
import { View } from 'react-native';

import { AppText } from '@src/components/ui/Typography/AppText';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { useOptionPillsStyles } from './OptionPills.styles';

export interface OptionPillsOption<T extends string> {
    value: T;
    label: string;
    leftSlot?: React.ReactNode;
}

interface OptionPillsBaseProps<T extends string> {
    options: OptionPillsOption<T>[];
}

export interface OptionPillsSingleSelectProps<T extends string>
    extends OptionPillsBaseProps<T> {
    selectedValue: T;
    onSelect: (value: T) => void;
}

export interface OptionPillsMultiSelectProps<T extends string>
    extends OptionPillsBaseProps<T> {
    selectedValues: readonly T[];
    onToggle: (value: T) => void;
}

export type OptionPillsProps<T extends string> =
    | OptionPillsSingleSelectProps<T>
    | OptionPillsMultiSelectProps<T>;

export const OptionPills = <T extends string>(props: OptionPillsProps<T>) => {
    const st = useOptionPillsStyles();
    const { options } = props;
    const isMultiSelect = 'selectedValues' in props;
    const selectedValues = isMultiSelect
        ? props.selectedValues
        : [props.selectedValue];

    const handlePress = (value: T): void => {
        if (isMultiSelect) {
            props.onToggle(value);
            return;
        }

        props.onSelect(value);
    };

    return (
        <View style={st.container}>
            {options.map(({ value, label, leftSlot }) => {
                const isActive = selectedValues.includes(value);

                return (
                    <GuardedPressable
                        key={value}
                        onPress={() => handlePress(value)}
                        style={[st.pill, isActive && st.pillActive]}
                    >
                        <View style={st.pillContent}>
                            {leftSlot && (
                                <View style={st.leftSlot}>{leftSlot}</View>
                            )}
                            <AppText
                                variant="bodySmall"
                                tone={isActive ? 'primary' : 'muted'}
                            >
                                {label}
                            </AppText>
                        </View>
                    </GuardedPressable>
                );
            })}
        </View>
    );
};
