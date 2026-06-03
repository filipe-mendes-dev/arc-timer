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
            gap: 10,
        },
        setRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
        },
        setIndexBubble: {
            width: 22,
            height: 22,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.accent.soft,
        },
        setIndexText: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.palette.accent.primary,
        },
        setTexts: {
            flex: 1,
            gap: 4,
        },
    }),
);
