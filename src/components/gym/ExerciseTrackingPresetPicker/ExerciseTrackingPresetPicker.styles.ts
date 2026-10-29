import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles((theme) =>
    StyleSheet.create({
        container: { gap: 8 },
        trigger: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 48,
        },
        iconBadge: {
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.surface,
        },
        summary: { flex: 1, minWidth: 0, gap: 4 },
    }),
);
