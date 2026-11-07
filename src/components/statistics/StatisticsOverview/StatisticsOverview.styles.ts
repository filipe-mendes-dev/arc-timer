import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
export const useStatisticsOverviewStyles = createStyles(() =>
    StyleSheet.create({
        metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
        metric: { flexGrow: 1, flexBasis: 95, minWidth: 0 },
        metricSkeleton: { width: 56 },
    }),
);
