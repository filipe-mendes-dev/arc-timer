import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
export const useRecentSessionsSectionStyles = createStyles(() =>
    StyleSheet.create({
        seeAll: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            minHeight: 44,
            flexShrink: 1,
        },
    }),
);
