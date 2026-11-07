import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import type { RunLayoutMode } from '../../hooks/useRunLayoutMode';

export const DEFAULT_ARC_SIZE = 280;

interface RunPhaseSectionStyleProps {
    layoutMode: RunLayoutMode;
    availableWidth: number;
    timerLength: number;
}

interface RunPhaseSectionMetrics {
    arcSize: number;
    arcContainerPaddingTop: number;
    arcWrapperPaddingTop: number;
    exerciseGap: number;
    timerFontSize: number;
}

export const metricsForRunLayout = (
    mode: RunLayoutMode,
    availableWidth = Number.POSITIVE_INFINITY,
): RunPhaseSectionMetrics => {
    let metrics: RunPhaseSectionMetrics;
    if (mode === 'minimal') {
        metrics = {
            arcSize: 210,
            arcContainerPaddingTop: 6,
            arcWrapperPaddingTop: 22,
            exerciseGap: 6,
            timerFontSize: 68,
        };
    } else if (mode === 'compact') {
        metrics = {
            arcSize: 240,
            arcContainerPaddingTop: 18,
            arcWrapperPaddingTop: 42,
            exerciseGap: 8,
            timerFontSize: 80,
        };
    } else {
        metrics = {
            arcSize: DEFAULT_ARC_SIZE,
            arcContainerPaddingTop: 24,
            arcWrapperPaddingTop: 60,
            exerciseGap: 10,
            timerFontSize: 96,
        };
    }
    const arcSize = Math.min(metrics.arcSize, Math.max(1, availableWidth));
    return {
        ...metrics,
        arcSize,
        timerFontSize: (metrics.timerFontSize * arcSize) / metrics.arcSize,
    };
};

export const useRunPhaseSectionStyles = createStyles(
    (theme: AppTheme, props: RunPhaseSectionStyleProps) => {
        const metrics = metricsForRunLayout(
            props.layoutMode,
            props.availableWidth,
        );
        const timerWidth = Math.max(1, (metrics.arcSize - 64) / 1.08);
        let timerFontSize = metrics.timerFontSize;
        if (props.timerLength > 2)
            timerFontSize = Math.min(
                metrics.timerFontSize * 0.7,
                timerWidth / (props.timerLength * 0.68),
            );

        return StyleSheet.create({
            mainContainer: {
                flex: 1,
                width: '100%',
            },

            // ===== Block pause (between blocks) =====
            blockPauseContainer: {
                flex: 1,
                width: '100%',
                paddingHorizontal: 16,
                paddingBottom: 30,
                justifyContent: 'center',
                gap: 16,
            },
            blockPauseHint: {
                textAlign: 'center',
                color: theme.palette.text.muted,
            },

            // ===== Arc + phase content =====
            arcContainer: {
                flex: 1,
                paddingTop: metrics.arcContainerPaddingTop,
                alignItems: 'center',
                justifyContent: 'flex-start',
            },

            arcWrapper: {
                width: metrics.arcSize,
                height: metrics.arcSize,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',

                paddingTop: metrics.arcWrapperPaddingTop,
            },

            timer: {
                position: 'absolute',
                width: timerWidth,
                textAlign: 'center',
                color: theme.palette.text.primary,
                fontSize: timerFontSize,
                fontVariant: ['tabular-nums'],
                marginTop: metrics.arcWrapperPaddingTop,
            },

            phasePillCompact: {
                paddingVertical: 4,
                paddingHorizontal: 14,
            },

            phasePillTextCompact: {
                fontSize: 14,
            },

            // Exercises Info
            exerciseInfoContainer: {
                width: '100%',
                paddingHorizontal: 10,
                gap: metrics.exerciseGap,
            },

            // Finishing zone
            finishedContainer: {
                flex: 1,
                width: '100%',
                gap: 16,
                justifyContent: 'center',
            },
        });
    },
);
