import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useStatisticsPeriodModalStyles = createStyles(() =>
    StyleSheet.create({
        modal: { maxHeight: '100%' },
        options: { flexShrink: 1, flexGrow: 0 },
    }),
);
