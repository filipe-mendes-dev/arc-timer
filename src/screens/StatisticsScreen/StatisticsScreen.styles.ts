import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
export const useStatisticsScreenStyles = createStyles((theme) =>
    StyleSheet.create({
        intro: { gap: 6 },
        introText: { flexShrink: 1 },
        actions: { gap: theme.layout.grid.gap },
    }),
);
