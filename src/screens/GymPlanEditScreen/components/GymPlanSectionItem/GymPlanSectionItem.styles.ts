import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useGymPlanSectionItemStyles = createStyles(() =>
    StyleSheet.create({
        body: {
            gap: 8,
        },
        sectionInfoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        exercisesContainer: {
            gap: 10,
        },
    }),
);
