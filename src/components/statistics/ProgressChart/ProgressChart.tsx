import { useState } from 'react';
import Svg, { Circle, Line, Path, Text } from 'react-native-svg';

import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { useProgressChartStyles } from './ProgressChart.styles';

export interface ProgressChartPoint {
    id: string;
    timestamp: number;
    value: number | null;
}

interface ProgressChartProps {
    points: readonly ProgressChartPoint[];
    selectedId?: string;
    onSelect: (id: string) => void;
    locale: string;
    accessibilityLabel: string;
    unitLabel: string;
    formatAxisValue?: (value: number) => string;
}

export const ProgressChart = ({
    points,
    selectedId,
    onSelect,
    locale,
    accessibilityLabel,
    unitLabel,
    formatAxisValue,
}: ProgressChartProps) => {
    const { theme } = useTheme();
    const st = useProgressChartStyles();
    const [width, setWidth] = useState(0);
    const measuredPoints = points.filter((point) => point.value !== null);
    const values = measuredPoints.map((point) => point.value ?? 0);
    const min = values.reduce(
        (minimum, value) => Math.min(minimum, value),
        values.at(0) ?? 0,
    );
    const max = Math.max(0, ...values);
    const padding = Math.max((max - min) * 0.15, max * 0.05, 1);
    const rawStep = Math.max((max - min + padding * 2) / 3, 1);
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const step = Math.ceil(rawStep / magnitude) * magnitude;
    const lower = Math.max(0, Math.floor((min - padding) / step) * step);
    const upper = Math.max(
        lower + step,
        Math.ceil((max + padding) / step) * step,
    );
    const formatValue = (value: number) =>
        formatAxisValue?.(value) ??
        new Intl.NumberFormat(locale, {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);
    const ticks = Array.from(
        { length: Math.round((upper - lower) / step) + 1 },
        (_, index) => lower + index * step,
    );
    const left = Math.max(
        32,
        ...ticks.map((value) => formatValue(value).length * 7 + 12),
    );
    const right = Math.max(left + 1, width - 8);
    const chartHeight = 216;
    const plotTop = 12;
    const plotBottom = chartHeight - 32;
    const firstTime = points[0]?.timestamp ?? 0;
    const lastTime = points[points.length - 1]?.timestamp ?? firstTime;
    const x = (timestamp: number): number => {
        if (firstTime === lastTime) return (left + right) / 2;
        return (
            left +
            ((timestamp - firstTime) / (lastTime - firstTime)) * (right - left)
        );
    };
    const y = (value: number) =>
        plotBottom -
        ((value - lower) / (upper - lower)) * (plotBottom - plotTop);
    let path = '';
    let hasPreviousValue = false;
    points.forEach((point) => {
        if (point.value === null) {
            hasPreviousValue = false;
            return;
        }
        path += `${hasPreviousValue ? 'L' : 'M'}${x(point.timestamp)},${y(point.value)} `;
        hasPreviousValue = true;
    });
    const selected = measuredPoints.find((point) => point.id === selectedId);
    const datePoints = [
        points.at(0),
        ...(right - left >= 280
            ? [points.at(Math.floor(points.length / 2))]
            : []),
        points.at(-1),
    ]
        .filter((point): point is ProgressChartPoint => point !== undefined)
        .filter(
            (point, index, list) =>
                list.findIndex(
                    (candidate) =>
                        new Date(candidate.timestamp).toDateString() ===
                        new Date(point.timestamp).toDateString(),
                ) === index,
        );

    return (
        <GuardedPressable
            style={st.chart}
            preventDoublePress={false}
            accessible
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}
            onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
            onPress={(event) => {
                const touchX = event.nativeEvent.locationX;
                const nearest = measuredPoints.reduce<
                    ProgressChartPoint | undefined
                >((closest, point) => {
                    if (
                        !closest ||
                        Math.abs(x(point.timestamp) - touchX) <
                            Math.abs(x(closest.timestamp) - touchX)
                    )
                        return point;
                    return closest;
                }, undefined);
                if (nearest) onSelect(nearest.id);
            }}
        >
            <AppText variant="caption" tone="muted">
                {unitLabel}
            </AppText>
            {width > 0 && values.length > 0 && (
                <Svg width={width} height={chartHeight} pointerEvents="none">
                    {ticks.map((tick) => (
                        <Line
                            key={`line-${tick}`}
                            x1={left}
                            x2={right}
                            y1={y(tick)}
                            y2={y(tick)}
                            stroke={theme.palette.border.subtle}
                        />
                    ))}
                    {ticks.map((tick) => (
                        <Text
                            key={`label-${tick}`}
                            transform={`translate(${left - 10} ${y(tick) + 4})`}
                            fill={theme.palette.text.muted}
                            fontSize={12}
                            textAnchor="end"
                        >
                            {formatValue(tick)}
                        </Text>
                    ))}
                    <Path
                        d={path}
                        fill="none"
                        stroke={theme.palette.accent.primary}
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                    />
                    {measuredPoints.length <= 60 &&
                        measuredPoints.map((point) => (
                            <Circle
                                key={point.id}
                                cx={x(point.timestamp)}
                                cy={y(point.value ?? 0)}
                                r={3}
                                fill={theme.palette.accent.primary}
                            />
                        ))}
                    {selected && (
                        <Line
                            x1={x(selected.timestamp)}
                            x2={x(selected.timestamp)}
                            y1={plotTop}
                            y2={plotBottom}
                            stroke={theme.palette.text.muted}
                            strokeDasharray="3 4"
                        />
                    )}
                    {selected && (
                        <Circle
                            cx={x(selected.timestamp)}
                            cy={y(selected.value ?? 0)}
                            r={6}
                            fill={theme.palette.background.card}
                            stroke={theme.palette.accent.primary}
                            strokeWidth={3}
                        />
                    )}
                    {datePoints.map((point, index) => (
                        <Text
                            key={point.id}
                            transform={`translate(${x(point.timestamp)} ${chartHeight - 8})`}
                            fill={theme.palette.text.muted}
                            fontSize={12}
                            textAnchor={
                                datePoints.length === 1
                                    ? 'middle'
                                    : index === 0
                                      ? 'start'
                                      : index === datePoints.length - 1
                                        ? 'end'
                                        : 'middle'
                            }
                        >
                            {new Date(point.timestamp).toLocaleDateString(
                                locale,
                                {
                                    day: 'numeric',
                                    month: 'short',
                                    year:
                                        firstTime === lastTime ||
                                        new Date(firstTime).getFullYear() !==
                                            new Date(lastTime).getFullYear()
                                            ? '2-digit'
                                            : undefined,
                                },
                            )}
                        </Text>
                    ))}
                </Svg>
            )}
        </GuardedPressable>
    );
};
