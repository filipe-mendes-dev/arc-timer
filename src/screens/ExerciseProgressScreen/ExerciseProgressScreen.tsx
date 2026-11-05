import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { ActionModal } from '@src/components/modals/ActionModal';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { StatisticsPeriodControl } from '@src/components/statistics/StatisticsPeriodControl/StatisticsPeriodControl';
import { ProgressChart } from '@src/components/statistics/ProgressChart/ProgressChart';
import { StatisticsOverview } from '@src/components/statistics/StatisticsOverview/StatisticsOverview';
import { StatisticsPeriodModal } from '@src/components/statistics/StatisticsPeriodModal/StatisticsPeriodModal';
import { RecentSessionsSection } from '@src/components/sessions/RecentSessionsSection/RecentSessionsSection';
import type { ExerciseProgressMetric } from '@src/core/statistics/gymStatistics';
import { useExerciseUsage, useGymStatistics } from '@src/data/statistics/statisticsQueries';
import { useExerciseDefinition } from '@src/data/exerciseDefinitions';
import { useTheme } from '@src/theme/ThemeProvider';
import { OptionPills } from '@src/screens/SettingsScreen/components/OptionPills';
import { useStatisticsPeriod } from '@src/screens/StatisticsScreen/useStatisticsPeriod';
import { formatDurationLabel } from '@src/helpers/time.helpers';
import { useExerciseProgressScreenStyles } from './ExerciseProgressScreen.styles';

const metrics: readonly ExerciseProgressMetric[] = [
    'weight',
    'reps',
    'volume',
    'duration',
    'distance',
];
const ExerciseProgressScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const st = useExerciseProgressScreenStyles();
    const period = useStatisticsPeriod();
    const { data: definition } = useExerciseDefinition(id);
    const { data, isPending, isError, refetch } = useGymStatistics(
        period.range,
        id,
    );
    const {
        data: usageData,
        isPending: isUsagePending,
        isError: hasUsageError,
        refetch: refetchUsage,
    } = useExerciseUsage(period.range, id);
    const usage = usageData?.[0];
    const isLoading = isPending || isUsagePending;
    const hasError = isError || hasUsageError;
    const exercise = data?.exercises[0];
    const name =
        definition?.name ?? exercise?.name ?? t('statistics.exerciseProgress');
    const [requestedMetric, setRequestedMetric] =
        useState<ExerciseProgressMetric>();
    const [draftMetric, setDraftMetric] =
        useState<ExerciseProgressMetric>('weight');
    const [isMetricModalVisible, setIsMetricModalVisible] = useState(false);
    const [selectedId, setSelectedId] = useState<string>();
    const locale = i18n.resolvedLanguage ?? i18n.language;
    const availableMetrics = metrics.filter(
        (metric) =>
            metric === requestedMetric ||
            exercise?.points.some((point) => point[metric] !== null),
    );
    const metric = requestedMetric ?? availableMetrics.at(0) ?? 'weight';
    const metricLabel = t(`statistics.metrics.${metric}`);
    const points = exercise?.points ?? [];
    const measuredPoints = points.filter((point) => point[metric] !== null);
    const selectedPoint =
        measuredPoints.find((point) => point.session.id === selectedId) ??
        measuredPoints.at(-1);
    const selectedIndex = measuredPoints.findIndex(
        (point) => point === selectedPoint,
    );
    const formatNumber = (value: number) =>
        new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
            value,
        );
    const formatValue = (value: number): string => {
        if (metric === 'volume')
            return t('statistics.values.volume', {
                value: formatNumber(value),
            });
        if (metric === 'weight')
            return t('statistics.values.weight', {
                value: formatNumber(value),
            });
        if (metric === 'duration') return formatDurationLabel(value, t);
        if (metric === 'distance')
            return t('statistics.values.distance', {
                value: formatNumber(value),
            });
        return t('statistics.values.reps', { count: value });
    };
    const selectedValue = selectedPoint?.[metric];
    let valueLabel = t('statistics.noMeasurement');
    if (selectedValue !== undefined && selectedValue !== null)
        valueLabel = formatValue(selectedValue);
    if (metric === 'weight' && selectedPoint?.weightReps != null)
        valueLabel = t('statistics.weightWithReps', {
            weight: valueLabel,
            count: selectedPoint.weightReps,
        });
    const hasUsage = (usage?.sessionCount ?? 0) > 0;
    const canShowAllTime = !hasUsage && period.selection.period !== 'all';
    let emptyTitle = t('statistics.noExerciseSessionsTitle');
    let emptyDescription = t('statistics.noExerciseSessionsDescription');
    if (canShowAllTime) {
        emptyTitle = t('statistics.emptyPeriodTitle');
        emptyDescription = t('statistics.emptyPeriodDescription', { period: period.rangeLabel });
    }
    if (hasUsage) {
        emptyTitle = t('statistics.noGymMeasurements');
        emptyDescription = t('statistics.gymMeasurementsDescription');
    }
    return (
        <MainContainer title={name} topBarLeftMode="back">
            {name.length > 28 && (
                <AppText variant="bodySmall" tone="secondary">
                    {name}
                </AppText>
            )}
            <ScreenSection
                title={t('statistics.progress')}
                rightAccessory={
                    <StatisticsPeriodControl
                        label={period.label}
                        onPress={period.openPicker}
                    />
                }
            >
                {isLoading && (
                    <ActivityIndicator color={theme.palette.accent.primary} />
                )}
                {hasError && (
                    <Button
                        accessibilityRole="button"
                        title={t('statistics.retry')}
                        variant="secondary"
                        onPress={async () => {
                            await Promise.all([refetch(), refetchUsage()]);
                        }}
                    />
                )}
                {!isLoading && !hasError && !exercise && (
                    <ListEmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                        actionLabel={canShowAllTime ? t('statistics.viewAllTime') : undefined}
                        onPressAction={canShowAllTime ? () => period.setSelection({ period: 'all' }) : undefined}
                    />
                )}
                {exercise && (
                    <>
                        {availableMetrics.length > 0 && (
                            <MetaCard
                                expandable={false}
                                withBottomFade={false}
                                summaryContent={
                                    <View style={st.chartCard}>
                                        <View style={st.summary}>
                                            <GuardedPressable
                                                style={st.chartHeader}
                                                accessibilityRole="button"
                                                accessibilityLabel={t(
                                                    'statistics.chooseMetric',
                                                )}
                                                accessibilityValue={{
                                                    text: metricLabel,
                                                }}
                                                accessibilityState={{
                                                    expanded:
                                                        isMetricModalVisible,
                                                }}
                                                onPress={() => {
                                                    setDraftMetric(metric);
                                                    setIsMetricModalVisible(
                                                        true,
                                                    );
                                                }}
                                            >
                                                <View
                                                    style={st.chartHeaderMeta}
                                                >
                                                    <AppText
                                                        variant="subtitle"
                                                        style={st.metricLabel}
                                                    >
                                                        {metricLabel}
                                                    </AppText>
                                                    <AppText
                                                        variant="caption"
                                                        tone="muted"
                                                    >
                                                        {t(
                                                            `statistics.metricDescriptions.${metric}`,
                                                        )}
                                                    </AppText>
                                                </View>
                                                <AppIcon
                                                    id="settings"
                                                    size={20}
                                                    color={
                                                        theme.palette.text
                                                            .primary
                                                    }
                                                />
                                            </GuardedPressable>

                                            {selectedPoint && (
                                                <AppText
                                                    variant="title1"
                                                    accessibilityLiveRegion="polite"
                                                >
                                                    {valueLabel}
                                                </AppText>
                                            )}
                                        </View>
                                        {selectedPoint && (
                                            <>
                                                <View style={st.navigation}>
                                                    <GuardedPressable
                                                        accessibilityRole="button"
                                                        style={st.arrow}
                                                        accessibilityLabel={t(
                                                            'statistics.previous',
                                                        )}
                                                        accessibilityState={{
                                                            disabled:
                                                                selectedIndex <=
                                                                0,
                                                        }}
                                                        disabled={
                                                            selectedIndex <= 0
                                                        }
                                                        onPress={() =>
                                                            setSelectedId(
                                                                measuredPoints[
                                                                    selectedIndex -
                                                                        1
                                                                ]?.session.id,
                                                            )
                                                        }
                                                    >
                                                        <AppIcon
                                                            id="back"
                                                            color={
                                                                theme.palette
                                                                    .text
                                                                    .inverted
                                                            }
                                                        />
                                                    </GuardedPressable>
                                                    <AppText
                                                        variant="caption"
                                                        style={st.sessionDate}
                                                    >
                                                        {new Date(
                                                            selectedPoint
                                                                .session
                                                                .startedAtMs,
                                                        ).toLocaleString(
                                                            locale,
                                                            {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </AppText>
                                                    <GuardedPressable
                                                        accessibilityRole="button"
                                                        style={st.arrow}
                                                        accessibilityLabel={t(
                                                            'statistics.next',
                                                        )}
                                                        accessibilityState={{
                                                            disabled:
                                                                selectedIndex >=
                                                                measuredPoints.length -
                                                                    1,
                                                        }}
                                                        disabled={
                                                            selectedIndex >=
                                                            measuredPoints.length -
                                                                1
                                                        }
                                                        onPress={() =>
                                                            setSelectedId(
                                                                measuredPoints[
                                                                    selectedIndex +
                                                                        1
                                                                ]?.session.id,
                                                            )
                                                        }
                                                    >
                                                        <AppIcon
                                                            id="back"
                                                            color={
                                                                theme.palette
                                                                    .text
                                                                    .inverted
                                                            }
                                                            style={st.nextIcon}
                                                        />
                                                    </GuardedPressable>
                                                </View>
                                                <ProgressChart
                                                    points={points.map(
                                                        (point) => ({
                                                            id: point.session
                                                                .id,
                                                            timestamp:
                                                                point.session
                                                                    .startedAtMs,
                                                            value: point[
                                                                metric
                                                            ],
                                                        }),
                                                    )}
                                                    selectedId={
                                                        selectedPoint.session.id
                                                    }
                                                    onSelect={setSelectedId}
                                                    locale={locale}
                                                    unitLabel={t(
                                                        `statistics.units.${metric}`,
                                                    )}
                                                    formatAxisValue={
                                                        metric === 'duration'
                                                            ? (value) =>
                                                                  `${Math.floor(value / 60)}:${String(Math.floor(value) % 60).padStart(2, '0')}`
                                                            : undefined
                                                    }
                                                    accessibilityLabel={t(
                                                        'statistics.chartDescription',
                                                        {
                                                            exercise:
                                                                exercise.name,
                                                            metric: t(
                                                                `statistics.metrics.${metric}`,
                                                            ),
                                                            count: measuredPoints.length,
                                                        },
                                                    )}
                                                />
                                                <View style={st.footer}>
                                                    <AppText
                                                        variant="caption"
                                                        tone="secondary"
                                                        style={st.setCount}
                                                    >
                                                        {t(
                                                            'statistics.workingSetCount',
                                                            {
                                                                count: selectedPoint.workingSetCount,
                                                            },
                                                        )}
                                                    </AppText>
                                                    <Button
                                                        accessibilityRole="button"
                                                        title={t(
                                                            'statistics.viewSession',
                                                        )}
                                                        variant="ghost"
                                                        style={st.viewSession}
                                                        icon={
                                                            <AppIcon
                                                                id="forwardCircle"
                                                                color={
                                                                    theme
                                                                        .palette
                                                                        .text
                                                                        .primary
                                                                }
                                                            />
                                                        }
                                                        onPress={() =>
                                                            router.push(
                                                                `/gymHistory/${selectedPoint.session.id}`,
                                                            )
                                                        }
                                                    />
                                                </View>
                                            </>
                                        )}
                                        {!selectedPoint && (
                                            <ListEmptyState
                                                title={t(
                                                    'statistics.noMetricInPeriod',
                                                    {
                                                        metric: metricLabel.toLocaleLowerCase(
                                                            locale,
                                                        ),
                                                    },
                                                )}
                                                description={t(
                                                    'statistics.noMetricPeriodDescription',
                                                    {
                                                        metric: metricLabel.toLocaleLowerCase(
                                                            locale,
                                                        ),
                                                        period: period.rangeLabel,
                                                    },
                                                )}
                                                size="small"
                                            />
                                        )}
                                    </View>
                                }
                            />
                        )}
                        {availableMetrics.length === 0 && (
                            <ListEmptyState
                                title={t('statistics.noMeasurementInPeriod')}
                                description={t(
                                    'statistics.noMeasurementPeriodDescription',
                                    { period: period.rangeLabel },
                                )}
                                size="small"
                            />
                        )}
                        <AppText variant="caption" tone="muted">
                            {t('statistics.warmupsExcluded')}
                        </AppText>
                    </>
                )}
            </ScreenSection>
            {hasUsage && (
                <>
                    <StatisticsOverview
                        title={t('statistics.exerciseUsage')}
                        metrics={[
                            {
                                label: t('statistics.sessionsIncludingExercise'),
                                value: usage?.sessionCount ?? 0,
                            },
                        ]}
                    />
                    <AppText variant="caption" tone="muted">
                        {t('statistics.usageHint')}
                    </AppText>
                </>
            )}
            {exercise && (
                <StatisticsOverview
                    metrics={[
                        {
                            label: t('statistics.sessions'),
                            value: exercise.sessionCount,
                        },
                        {
                            label: t('statistics.workingSets'),
                            value: exercise.workingSetCount,
                        },
                        {
                            label: t('statistics.totalReps'),
                            value:
                                exercise.totalReps ??
                                t('exerciseDefinitions.emptyValue'),
                        },
                    ]}
                />
            )}
            {hasUsage && (
                <RecentSessionsSection
                    filters={{
                        exerciseDefinitionId: id,
                        ...period.range,
                    }}
                />
            )}
            <ActionModal
                visible={isMetricModalVisible}
                style={st.metricModal}
                title={t('statistics.chooseMetric')}
                onClose={() => setIsMetricModalVisible(false)}
                primaryAction={{
                    title: t('history.filters.apply'),
                    disabled: !availableMetrics.includes(draftMetric),
                    onPress: () => {
                        setRequestedMetric(draftMetric);
                        setIsMetricModalVisible(false);
                    },
                }}
                secondaryAction={{
                    title: t('common.actions.cancel'),
                    onPress: () => setIsMetricModalVisible(false),
                }}
            >
                <ScrollView style={st.metricOptions}>
                    <OptionPills
                        options={availableMetrics.map((value) => ({
                            value,
                            label: t(`statistics.metrics.${value}`),
                        }))}
                        selectedValue={draftMetric}
                        onSelect={setDraftMetric}
                    />
                </ScrollView>
            </ActionModal>
            <StatisticsPeriodModal
                visible={period.isPickerVisible}
                selection={period.selection}
                onChange={period.setSelection}
                onClose={period.closePicker}
            />
        </MainContainer>
    );
};
export default ExerciseProgressScreen;
