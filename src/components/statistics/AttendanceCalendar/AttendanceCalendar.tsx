import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import { getLocalDayStart } from '@src/core/statistics/gymStatistics';
import { useAttendanceCalendarStyles } from './AttendanceCalendar.styles';

interface AttendanceCalendarProps {
    month: number;
    sessionsPerDay: ReadonlyMap<number, number>;
    selectedDay: number;
    onSelectDay: (day: number) => void;
}

export const AttendanceCalendar = ({
    month,
    sessionsPerDay,
    selectedDay,
    onSelectDay,
}: AttendanceCalendarProps) => {
    const st = useAttendanceCalendarStyles();
    const { t, i18n } = useTranslation();
    const locale = i18n.resolvedLanguage ?? i18n.language;
    const date = new Date(month);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const offset = (date.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;
    const today = getLocalDayStart(Date.now());

    return (
        <View style={st.grid}>
            {Array.from({ length: 7 }, (_, index) => (
                <View key={`weekday-${index}`} style={st.cell}>
                    <AppText variant="caption" tone="muted" style={st.weekday}>
                        {new Date(2024, 0, index + 1).toLocaleDateString(
                            locale,
                            {
                                weekday: 'narrow',
                            },
                        )}
                    </AppText>
                </View>
            ))}
            {Array.from({ length: cellCount }, (_, index) => {
                const day = index - offset + 1;
                if (day < 1 || day > daysInMonth)
                    return <View key={`empty-${index}`} style={st.cell} />;
                const timestamp = new Date(year, monthIndex, day).getTime();
                const count = sessionsPerDay.get(timestamp) ?? 0;
                const isSelected = timestamp === selectedDay;
                const isFuture = timestamp > today;
                return (
                    <View key={timestamp} style={st.cell}>
                        <GuardedPressable
                            style={[
                                st.day,
                                count > 0 && st.trained,
                                isSelected && st.selected,
                                isFuture && st.disabled,
                            ]}
                            disabled={isFuture}
                            accessibilityRole="button"
                            accessibilityState={{
                                selected: isSelected,
                                disabled: isFuture,
                            }}
                            accessibilityLabel={t('statistics.calendarDay', {
                                date: new Date(timestamp).toLocaleDateString(
                                    locale,
                                    {
                                        dateStyle: 'full',
                                    },
                                ),
                                count,
                            })}
                            onPress={() => onSelectDay(timestamp)}
                        >
                            <AppText
                                variant="caption"
                                style={isSelected ? st.selectedText : undefined}
                            >
                                {day}
                            </AppText>
                            {count > 0 && (
                                <View
                                    style={[
                                        st.dot,
                                        isSelected && st.selectedDot,
                                    ]}
                                />
                            )}
                        </GuardedPressable>
                    </View>
                );
            })}
        </View>
    );
};
