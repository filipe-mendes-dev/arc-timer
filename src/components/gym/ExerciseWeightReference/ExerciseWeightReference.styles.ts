import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useStyles = createStyles(() =>
    StyleSheet.create({
        valueRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            columnGap: 8,
            rowGap: 2,
            marginTop: 6,
        },
        weight: {
            flexShrink: 1,
            fontVariant: ['tabular-nums'],
        },
    }),
);
