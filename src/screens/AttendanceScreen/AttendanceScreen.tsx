import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { StatisticsOverview } from '@src/components/statistics/StatisticsOverview/StatisticsOverview';
import { MonthControl } from '@src/components/statistics/MonthControl/MonthControl';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { AttendanceCalendar } from '@src/components/statistics/AttendanceCalendar/AttendanceCalendar';
import { getLocalDayStart } from '@src/core/statistics/gymStatistics';
import { useGymAttendanceStatistics } from '@src/data/statistics/statisticsQueries';
import { SessionCardSkeleton } from '@src/components/sessions/SessionCardSkeleton/SessionCardSkeleton';
import { TrainingSessionListItem } from '@src/screens/HistoryScreen/components/TrainingSessionListItem';
import { useAttendanceScreenStyles } from './AttendanceScreen.styles';

const AttendanceScreen = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const st = useAttendanceScreenStyles();
    const now = new Date();
    const currentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
    ).getTime();
    const { month: initialMonth } = useLocalSearchParams<{ month?: string }>();
    const [month, setMonth] = useState(() => {
        const timestamp = Number(initialMonth);
        if (!Number.isFinite(timestamp) || timestamp > Date.now())
            return currentMonth;
        const date = new Date(timestamp);
        return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    });
    const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);
    const [requestedDay, setRequestedDay] = useState<number>();
    const { data, isPending, isError, refetch } = useGymAttendanceStatistics(month);
    const sessions = data?.sessions ?? [];
    const sessionsPerDay = new Map<number, number>();
    sessions.forEach((session) => {
        const day = getLocalDayStart(session.startedAtMs);
        sessionsPerDay.set(day, (sessionsPerDay.get(day) ?? 0) + 1);
    });
    const selectedDay =
        requestedDay ?? getLocalDayStart(sessions[0]?.startedAtMs ?? month);
    const selectedSessions = sessions.filter(
        (session) => getLocalDayStart(session.startedAtMs) === selectedDay,
    );
    const locale = i18n.resolvedLanguage ?? i18n.language;

    return (
        <MainContainer
            title={t('statistics.attendance')}
            topBarLeftMode="back"
            containerStyle={st.content}
        >
            {isError && (
                <Button
                    title={t('statistics.retry')}
                    variant="secondary"
                    onPress={async () => {
                        await refetch();
                    }}
                />
            )}
            <StatisticsOverview
                isLoading={isPending}
                metrics={[
                    {
                        label: t('statistics.trainingDays'),
                        value: data?.trainingDayCount ?? t('exerciseDefinitions.emptyValue'),
                    },
                    {
                        label: t('statistics.sessions'),
                        value: data ? sessions.length : t('exerciseDefinitions.emptyValue'),
                    },
                ]}
            />
            <MetaCard
                expandable={false}
                withBottomFade={false}
                summaryContent={
                    <View style={st.calendar}>
                        <MonthControl
                            month={month}
                            onChange={(next) => {
                                setMonth(next);
                                setRequestedDay(undefined);
                            }}
                            isPickerVisible={isMonthPickerVisible}
                            onOpenPicker={() => setMonthPickerVisible(true)}
                            onClosePicker={() =>
                                setMonthPickerVisible(false)
                            }
                        />
                        <AttendanceCalendar
                            month={month}
                            sessionsPerDay={sessionsPerDay}
                            selectedDay={selectedDay}
                            onSelectDay={setRequestedDay}
                        />
                    </View>
                }
            />
            <AppText variant="caption" tone="muted">
                {t('statistics.attendanceHint')}
            </AppText>
            <ScreenSection
                title={new Date(selectedDay).toLocaleDateString(
                    locale,
                    {
                        dateStyle: 'long',
                    },
                )}
            >
                {isPending && [0, 1].map((index) => <SessionCardSkeleton key={index} />)}
                {selectedSessions.map((session) => (
                    <TrainingSessionListItem
                        key={session.id}
                        session={session}
                        onPress={() =>
                            router.push(`/gymHistory/${session.id}`)
                        }
                    />
                ))}
                {!isPending && !isError && selectedSessions.length === 0 && (
                    <ListEmptyState
                        title={t('statistics.noSessions')}
                        description={t(
                            'statistics.noSessionsDescription',
                        )}
                        size="small"
                    />
                )}
            </ScreenSection>
        </MainContainer>
    );
};

export default AttendanceScreen;
