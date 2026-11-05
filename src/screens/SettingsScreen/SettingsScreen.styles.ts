import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

interface SettingsStyleProps {
    fontScale: number;
}

export const useSettingsStyles = createStyles(
    (theme: AppTheme, props: SettingsStyleProps) =>
        StyleSheet.create({
            backupActions: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
            },
            backupAction: {
                flexGrow: 1,
                flexBasis: Math.ceil(125 * props.fontScale),
                minWidth: 0,
            },
            backupActionText: { flexShrink: 1, textAlign: 'center' },
            separator: {
                height: 1,
                backgroundColor: theme.palette.border.subtle,
            },
            aboutContent: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                marginTop: 8,
            },
            aboutInfo: {
                flex: 1,
                gap: 4,
            },
            appName: {
                color: theme.palette.text.primary,
            },
            copyright: {
                marginTop: 4,
            },
            flagEmoji: {
                fontSize: 16,
            },
        }),
);
