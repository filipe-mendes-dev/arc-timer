import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Separator } from '@src/components/ui/Separator/Separator';
import { StatisticsOverview } from '@src/components/statistics/StatisticsOverview/StatisticsOverview';
import { StatisticsPeriodModal } from '@src/components/statistics/StatisticsPeriodModal/StatisticsPeriodModal';
import { StatisticsPeriodControl } from '@src/components/statistics/StatisticsPeriodControl/StatisticsPeriodControl';
import { HomeActionTile } from '@src/screens/HomeScreen/components/HomeActionTile/HomeActionTile';
import { useGymStatistics } from '@src/data/statistics/statisticsQueries';
import { useTheme } from '@src/theme/ThemeProvider';
import { useStatisticsPeriod } from './useStatisticsPeriod';
import { useStatisticsScreenStyles } from './StatisticsScreen.styles';

const StatisticsScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStatisticsScreenStyles();
    const router = useRouter();
    const period = useStatisticsPeriod();
    const { data, isPending, isError, refetch } = useGymStatistics(
        period.range,
    );
    return (
        <MainContainer
            title={t('statistics.title')}
            topBarLeftMode="drawer"
            gap={theme.layout.mainContainer.gap}
        >
            <View style={st.intro}>
                <AppText variant="title1" style={st.introText}>
                    {t('statistics.heading')}
                </AppText>
                <AppText
                    variant="bodySmall"
                    tone="secondary"
                    style={st.introText}
                >
                    {t('statistics.subtitle')}
                </AppText>
            </View>
            <View style={st.actions}>
                <HomeActionTile
                    title={t('statistics.exerciseProgress')}
                    subtitle={t('statistics.exerciseProgressDescription')}
                    icon="stats"
                    variant="secondary"
                    onPress={() =>
                        router.push({
                            pathname: '/statistics/exercises',
                            params: period.routeParams,
                        })
                    }
                />
                <HomeActionTile
                    title={t('statistics.attendance')}
                    subtitle={t('statistics.attendanceDescription')}
                    icon="calendar"
                    variant="secondary"
                    onPress={() =>
                        router.push({
                            pathname: '/statistics/attendance',
                            params: {
                                month: String(period.range.endedBeforeMs - 1),
                            },
                        })
                    }
                />
            </View>
            <Separator />
            {!data && <StatisticsPeriodControl label={period.label} onPress={period.openPicker} />}
            {isPending && (
                <ActivityIndicator color={theme.palette.accent.primary} />
            )}
            {isError && (
                <Button
                    title={t('statistics.retry')}
                    variant="secondary"
                    onPress={async () => {
                        await refetch();
                    }}
                />
            )}
            {data && (
                <StatisticsOverview
                    rightAccessory={<StatisticsPeriodControl label={period.label} onPress={period.openPicker} />}
                    metrics={[
                        {
                            label: t('statistics.trainingDays'),
                            value: data.trainingDayCount,
                        },
                        {
                            label: t('statistics.sessions'),
                            value: data.sessions.length,
                        },
                    ]}
                />
            )}
            <StatisticsPeriodModal
                visible={period.isPickerVisible}
                selection={period.selection}
                onChange={period.setSelection}
                onClose={period.closePicker}
            />
        </MainContainer>
    );
};
export default StatisticsScreen;
