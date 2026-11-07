import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useSessionCardSkeletonStyles = createStyles(() =>
    StyleSheet.create({
        content: { gap: 12 },
        date: { width: '55%', height: 12 },
        title: { width: '70%', height: 20 },
        metrics: { flexDirection: 'row', gap: 12 },
        metric: { width: '30%' },
    }),
);
