import { StyleSheet } from 'react-native';

import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';

export const useGymExerciseCardStyles = createStyles((theme: AppTheme) =>
    StyleSheet.create({
        body: {
            gap: 8,
        },
        exerciseName: {
            flexShrink: 1,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        setsContainer: {
            gap: 8,
        },
        setRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        setStatusIcon: {
            marginTop: 1,
        },
        setSummary: {
            flex: 1,
            minWidth: 0,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        setTitle: {
            flexShrink: 0,
            fontWeight: '600',
            color: theme.palette.text.primary,
        },
        setDetails: {
            flex: 1,
            minWidth: 0,
        },
    }),
);
