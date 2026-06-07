import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles(() =>
    StyleSheet.create({
        sectionMetaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        sectionMetaText: {
            flex: 1,
            minWidth: 0,
        },
        sectionExercisesContainer: {
            gap: 16,
        },
    }),
);
