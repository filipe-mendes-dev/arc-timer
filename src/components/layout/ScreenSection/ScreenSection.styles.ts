import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import type { ScreenSectionTopSpacing } from './ScreenSection.interfaces';

type ScreenSectionStyleProps = {
    topSpacing?: ScreenSectionTopSpacing;
    gap: number;
    flex: boolean;
};

const getTopMargin = (spacing?: ScreenSectionTopSpacing): number => {
    switch (spacing) {
        case undefined:
            return 0;
        case 'small':
            return 8;
        case 'medium':
            return 16;
        case 'large':
            return 24;
        case 'none':
            return 0;
    }
};

export const useScreenSectionStyles = createStyles(
    (theme: AppTheme, props: ScreenSectionStyleProps) =>
        StyleSheet.create({
            container: {
                marginTop: getTopMargin(props.topSpacing),
                width: '100%',
                flex: props.flex ? 1 : undefined,
            },
            headerRow: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                columnGap: 12,
                rowGap: 4,
                marginBottom: 14,
            },
            title: {
                flexShrink: 1,
                color: theme.palette.text.header,
            },
            content: {
                gap: props.gap,
                width: '100%',
                flex: props.flex ? 1 : undefined,
            },
        })
);
