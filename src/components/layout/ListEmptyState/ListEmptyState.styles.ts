import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';

export const useListEmptyStateStyles = createStyles(() =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            gap: 8,
            width: '100%',
        },
        description: {
            textAlign: 'center',
            maxWidth: 260,
        },
        button: {
            marginTop: 8,
        },
    }),
);
