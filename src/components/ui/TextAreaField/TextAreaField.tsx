import { forwardRef } from 'react';
import type { View } from 'react-native';

import type { TextFieldProps } from '../TextField/TextField.interfaces';
import { TextField } from '../TextField/TextField';
import { useTextAreaFieldStyles } from './TextAreaField.styles';

export interface TextAreaFieldProps extends Omit<TextFieldProps, 'multiline'> {
    minHeight?: number;
}

export const TextAreaField = forwardRef<View, TextAreaFieldProps>(
    ({ inputStyle, minHeight, numberOfLines = 4, ...props }, ref) => {
        const st = useTextAreaFieldStyles({ minHeight });

        return (
            <TextField
                {...props}
                ref={ref}
                multiline
                numberOfLines={numberOfLines}
                inputStyle={[st.input, inputStyle]}
            />
        );
    },
);

TextAreaField.displayName = 'TextAreaField';
