import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
export const useExerciseProgressScreenStyles = createStyles((theme) =>
    StyleSheet.create({
        chartCard: { gap: theme.layout.card.padding },
        summary: { gap: 14 },
        chartHeaderMeta: { gap: 6 },
        chartHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        metricLabel: { flex: 1, minWidth: 0 },
        metricModal: { maxHeight: '100%' },
        metricOptions: { flexShrink: 1, flexGrow: 0 },
        navigation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        sessionDate: { flex: 1, minWidth: 0, textAlign: 'center' },
        arrow: {
            padding: 4,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.primary,
            borderRadius: 22,
        },
        nextIcon: { transform: [{ rotate: '180deg' }] },
        footer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 4,
        },
        setCount: { flexGrow: 1, flexBasis: 90 },
        viewSession: {
            // minHeight: 44,
            flexShrink: 1,
            paddingHorizontal: 0,
            paddingVertical: 0,
        },
    }),
);
