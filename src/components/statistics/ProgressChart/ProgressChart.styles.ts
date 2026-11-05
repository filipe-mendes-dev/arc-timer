import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useProgressChartStyles = createStyles(() =>
    StyleSheet.create({
        chart: { width: '100%', gap: 8 },
    }),
);
