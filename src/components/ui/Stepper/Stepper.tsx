import React, { useCallback, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useStepperStyles } from './Stepper.styles';
import { MiniButton } from './MiniButton';
import { FieldLabel } from '@src/components/ui/FieldLabel/FieldLabel';
import type { TextTone } from '@src/components/ui/Typography/AppText';
import { useMainContainerScroll } from '@src/components/layout/MainContainer/MainContainerScrollContext';

interface Props {
    value: number;
    onChange: (next: number) => void;
    allowDecimal?: boolean;
    decimalPlaces?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    labelTone?: TextTone;
    formatValue?: (value: number) => string;
    testID?: string;
}

const clamp = (n: number, min?: number, max?: number) =>
    Math.max(
        min ?? Number.NEGATIVE_INFINITY,
        Math.min(max ?? Number.POSITIVE_INFINITY, n),
    );

const roundToDecimalPlaces = (
    value: number,
    decimalPlaces?: number,
): number => {
    if (decimalPlaces === undefined) {
        return value;
    }

    const factor = 10 ** decimalPlaces;
    return Math.round(value * factor) / factor;
};

const parseIntegerInput = (txt: string): number => {
    const n = parseInt((txt || '0').replace(/\D+/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
};

const parseDecimalInput = (txt: string): number => {
    const normalized = (txt || '0').replace(',', '.');
    const cleaned = normalized.replace(/[^0-9.]+/g, '');
    const parts = cleaned.split('.');
    const integerPart = parts[0] ?? '0';
    const decimalPart = parts.slice(1).join('');
    const valueText = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
    const n = parseFloat(valueText);

    return Number.isFinite(n) ? n : 0;
};

const parseInputValue = (txt: string, allowDecimal: boolean): number => {
    if (allowDecimal) {
        return parseDecimalInput(txt);
    }

    return parseIntegerInput(txt);
};

export const Stepper: React.FC<Props> = ({
    value,
    onChange,
    allowDecimal = false,
    decimalPlaces,
    min = 0,
    max,
    step = 1,
    label,
    labelTone = 'secondary',
    formatValue,
    testID,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputText, setInputText] = useState(String(value));
    const st = useStepperStyles({ isFocused });
    const scrollContext = useMainContainerScroll();
    const anchorRef = useRef<View | null>(null);

    const inc = useCallback(
        () => {
            const next = clamp(
                roundToDecimalPlaces(value + step, decimalPlaces),
                min,
                max,
            );

            setInputText(String(next));
            onChange(next);
        },
        [decimalPlaces, max, min, onChange, step, value],
    );

    const dec = useCallback(
        () => {
            const next = clamp(
                roundToDecimalPlaces(value - step, decimalPlaces),
                min,
                max,
            );

            setInputText(String(next));
            onChange(next);
        },
        [decimalPlaces, max, min, onChange, step, value],
    );

    const onText = useCallback(
        (txt: string) => {
            setInputText(txt);
            const parsed = parseInputValue(txt, allowDecimal);
            const rounded = roundToDecimalPlaces(parsed, decimalPlaces);

            onChange(clamp(rounded, min, max));
        },
        [allowDecimal, decimalPlaces, max, min, onChange],
    );

    const disableDec = value <= min;
    const disableInc = max !== undefined && value >= max;
    const formattedValue = formatValue ? formatValue(value) : String(value);
    const inputValue = isFocused ? inputText : formattedValue;

    return (
        <View ref={anchorRef} style={st.wrap}>
            {label ? <FieldLabel label={label} tone={labelTone} /> : null}

            <View style={st.row}>
                <MiniButton
                    label="–"
                    onPress={dec}
                    disabled={disableDec}
                    buttonStyle={st.miniButton}
                    disabledStyle={st.miniButtonDisabled}
                    textStyle={st.miniButtonText}
                    pressedStyle={st.pressed}
                />

                <TextInput
                    keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
                    value={inputValue}
                    onChangeText={onText}
                    style={st.input}
                    onFocus={() => {
                        setInputText(String(value));
                        setIsFocused(true);
                        scrollContext?.scrollFocusedInputIntoView(
                            anchorRef,
                            0.5,
                        );
                    }}
                    onBlur={() => setIsFocused(false)}
                    returnKeyType="done"
                    testID={testID}
                />

                <MiniButton
                    label="+"
                    onPress={inc}
                    disabled={disableInc}
                    buttonStyle={st.miniButton}
                    disabledStyle={st.miniButtonDisabled}
                    textStyle={st.miniButtonText}
                    pressedStyle={st.pressed}
                />
            </View>
        </View>
    );
};
