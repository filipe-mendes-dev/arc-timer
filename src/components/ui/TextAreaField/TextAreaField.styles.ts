import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

interface TextAreaFieldStyleProps {
    minHeight?: number;
}

export const useTextAreaFieldStyles = createStyles(
    (_theme: AppTheme, props: TextAreaFieldStyleProps) =>
        StyleSheet.create({
            input: {
                minHeight: props.minHeight ?? 112,
                borderRadius: 16,
            },
        }),
);
