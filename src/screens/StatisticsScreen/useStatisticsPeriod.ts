import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
    getStatisticsRange,
    type StatisticsPeriodSelection,
} from '@src/core/statistics/gymStatistics';

export const useStatisticsPeriod = () => {
    const params = useLocalSearchParams<{ period?: string }>();
    const { t, i18n } = useTranslation();
    const [selection, setSelection] = useState<StatisticsPeriodSelection>(
        () => {
            const period = params.period;
            if (
                period === 'month' ||
                period === 'threeMonths' ||
                period === 'year'
            )
                return { period };
            return { period: 'all' };
        },
    );
    const [now, setNow] = useState(Date.now);
    const [isPickerVisible, setPickerVisible] = useState(false);
    useFocusEffect(
        useCallback(() => {
            setNow(Date.now());
        }, []),
    );
    const range = useMemo(
        () => getStatisticsRange(selection.period, now),
        [selection.period, now],
    );
    const label = t(`statistics.period.${selection.period}`);
    const locale = i18n.resolvedLanguage ?? i18n.language;
    let rangeLabel = label;
    if (range.startedAtMs !== undefined) {
        const start = new Date(range.startedAtMs);
        const end = new Date(now);
        rangeLabel = start.toLocaleDateString(locale, {
            month: 'long',
            year: 'numeric',
        });
        if (selection.period === 'year')
            rangeLabel = start.toLocaleDateString(locale, { year: 'numeric' });
        if (selection.period === 'threeMonths')
            rangeLabel = t('statistics.sessionPeriod', {
                start: rangeLabel,
                end: end.toLocaleDateString(locale, {
                    month: 'long',
                    year: 'numeric',
                }),
            });
    }
    return {
        selection,
        setSelection,
        range,
        label,
        rangeLabel,
        routeParams: { period: selection.period },
        now,
        openPicker: () => setPickerVisible(true),
        isPickerVisible,
        closePicker: () => setPickerVisible(false),
    };
};
