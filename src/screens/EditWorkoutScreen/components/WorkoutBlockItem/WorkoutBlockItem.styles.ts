import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';

export const useWorkoutBlockItemStyles = createStyles(() =>
    StyleSheet.create({
        body: {
            gap: 8,
        },
        blockInfoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        exercisesContainer: {
            gap: 10,
        },
    })
);
