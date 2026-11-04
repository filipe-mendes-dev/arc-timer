import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useSkeletonStyles = createStyles((theme) =>
    StyleSheet.create({
        base: {
            width: '100%',
            height: 16,
            borderRadius: 6,
            backgroundColor: theme.palette.border.subtle,
        },
    }),
);
