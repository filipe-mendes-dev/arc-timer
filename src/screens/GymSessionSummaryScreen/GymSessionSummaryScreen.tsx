import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import type {
    GymExerciseRecordSet,
    GymSession,
} from '@src/core/entities/gym.interfaces';
import { formatCompletedGymDuration } from '@src/core/gyms/formatGymDuration';
import {
    useGymPlan,
    useStartGymSessionFromPlan,
} from '@src/data/gymPlans';
import {
    useDeleteGymSession,
    useGymExerciseDefinitions,
    useGymSession,
    useStartGymSessionFromSessionSnapshot,
} from '@src/data/gymSessions';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymSessionSummaryScreen.styles';

interface GymSessionMetric {
    isDimmed: boolean;
    key: string;
    label: string;
    value: string;
}

const getMetricTone = (metric: GymSessionMetric): 'muted' | 'primary' => {
    if (metric.isDimmed) return 'muted';

    return 'primary';
};

const formatWeight = (weightGrams: number): string => {
    const weightKg = weightGrams / 1000;
    return Number.isInteger(weightKg) ? `${weightKg}` : weightKg.toFixed(1);
};

const formatDistance = (distanceMeters: number): string => {
    const distanceKm = distanceMeters / 1000;

    if (Number.isInteger(distanceKm)) {
        return `${distanceKm}`;
    }

    return distanceKm.toFixed(2);
};

const formatDurationMinutes = (durationSec: number): string => {
    const durationMin = Math.round(durationSec / 60);

    if (durationSec > 0 && durationMin < 1) {
        return '1 min';
    }

    if (durationMin < 60) {
        return `${durationMin} min`;
    }

    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;

    if (minutes === 0) {
        return `${hours} h`;
    }

    return `${hours} h ${minutes} min`;
};

const formatRpe = (rpeTenths: number): string => {
    const rpe = rpeTenths / 10;
    return Number.isInteger(rpe) ? `${rpe}` : rpe.toFixed(1);
};

const getCompletedSetCount = (session: GymSession): number =>
    session.exerciseRecords.reduce(
        (total, record) =>
            total +
            record.sets.filter((set) => set.completedAtMs !== undefined)
                .length,
        0,
    );

const GymSessionSummaryScreen = () => {
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const { theme } = useTheme();
    const st = useStyles();
    const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
    const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const { data: session } = useGymSession(sessionId);
    const { data: sourceGymPlan } = useGymPlan(session?.sourceGymPlanId);
    const { data: exerciseDefinitions = [] } = useGymExerciseDefinitions();
    const deleteGymSession = useDeleteGymSession();
    const startSessionFromPlan = useStartGymSessionFromPlan();
    const startSessionFromSnapshot = useStartGymSessionFromSessionSnapshot();
    const locale = i18n.resolvedLanguage ?? i18n.language;

    const exerciseNameById = new Map(
        exerciseDefinitions.map((definition) => [definition.id, definition.name]),
    );

    const getSetDetails = (set: GymExerciseRecordSet): string => {
        const details: string[] = [];

        if (set.reps !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.reps', { count: set.reps }),
            );
        }

        if (set.weightGrams !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.weight', {
                    value: formatWeight(set.weightGrams),
                }),
            );
        }

        if (set.durationSec !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.duration', {
                    value: formatDurationMinutes(set.durationSec),
                }),
            );
        }

        if (set.distanceMeters !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.distance', {
                    value: formatDistance(set.distanceMeters),
                }),
            );
        }

        if (set.rpeTenths !== undefined) {
            details.push(
                t('gymExerciseData.setDetails.rpe', {
                    value: formatRpe(set.rpeTenths),
                }),
            );
        }

        if (set.notes) {
            details.push(set.notes);
        }

        if (details.length === 0) {
            return t('gymExerciseData.setDetails.empty');
        }

        return details.join(' · ');
    };

    if (!session) {
        return (
            <MainContainer title={t('gymSessionSummary.title')} scroll={false}>
                <View style={st.emptyContainer}>
                    <AppText variant="title3" style={st.emptyTitle}>
                        {t('gymSessionSummary.notFound')}
                    </AppText>

                    <Button
                        title={t('common.actions.back')}
                        variant="secondary"
                        onPress={() => router.back()}
                    />
                </View>
            </MainContainer>
        );
    }

    const startedAt = new Date(session.startedAtMs);
    const startedAtLabel =
        startedAt.toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }) +
        ' · ' +
        startedAt.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    let endedAtLabel = t('gymSessionSummary.status.incomplete');

    if (session.endedAtMs !== undefined) {
        endedAtLabel = new Date(session.endedAtMs).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    const setCount = session.exerciseRecords.reduce(
        (total, record) => total + record.sets.length,
        0,
    );
    const completedSetCount = getCompletedSetCount(session);
    const durationText = formatCompletedGymDuration(
        session.startedAtMs,
        session.endedAtMs,
    );
    const sourceGymPlanId =
        sourceGymPlan?.status === 'active' ? sourceGymPlan.id : undefined;
    const canOpenSourceGymPlan = sourceGymPlanId !== undefined;
    const isStartingSession =
        startSessionFromPlan.isPending || startSessionFromSnapshot.isPending;
    let actionErrorMessage = '';
    if (startSessionFromPlan.error || startSessionFromSnapshot.error) {
        actionErrorMessage = t('gymSessionSummary.errors.runAgainFailed');
    }
    const metrics: GymSessionMetric[] = [
        {
            key: 'duration',
            label: t('run.stats.duration'),
            value: durationText,
            isDimmed: durationText === '0 min',
        },
        {
            key: 'exercises',
            label: t('run.stats.exercises'),
            value: `${session.exerciseRecords.length}`,
            isDimmed: session.exerciseRecords.length === 0,
        },
        {
            key: 'sets',
            label: t('run.stats.sets'),
            value: `${setCount}`,
            isDimmed: setCount === 0,
        },
        {
            key: 'completedSets',
            label: t('gymSessionSummary.completedSets'),
            value: `${completedSetCount}`,
            isDimmed: completedSetCount === 0,
        },
    ];
    const metricRows = [metrics.slice(0, 2), metrics.slice(2, 4)];

    const handleDeleteSession = () => {
        deleteGymSession.mutate(session.id, {
            onSuccess: () => {
                setDeleteConfirmVisible(false);
                router.back();
            },
        });
    };

    const handleOpenGymPlan = () => {
        if (sourceGymPlanId === undefined) return;

        router.push(`/gymPlans/${sourceGymPlanId}`);
    };

    const handleRunAgain = () => {
        if (sourceGymPlanId !== undefined) {
            startSessionFromPlan.mutate(
                { gymPlanId: sourceGymPlanId },
                { onSuccess: () => router.push('/gymSession') },
            );
            return;
        }

        startSessionFromSnapshot.mutate(
            { sessionId: session.id },
            { onSuccess: () => router.push('/gymSession') },
        );
    };

    return (
        <>
            <MainContainer
                title={t('gymSessionSummary.title')}
                gap={0}
                topBarOptions={[
                    {
                        id: 'delete-session',
                        label: t('gymSessionSummary.actions.delete'),
                        icon: 'trash',
                        destructive: true,
                        onPress: () => setDeleteConfirmVisible(true),
                    },
                ]}
            >
                <ScreenSection topSpacing="small" gap={6}>
                <View style={st.headerContainer}>
                    <AppText
                        variant="title2"
                        numberOfLines={2}
                        style={st.headerTitle}
                    >
                        {t('gymHistory.sessionTitle')}
                    </AppText>

                    <View style={st.headerDateRow}>
                        <View style={st.headerDateItem}>
                            <AppIcon
                                id="calendar"
                                size={14}
                                color={theme.palette.text.secondary}
                            />
                            <AppText variant="bodySmall" tone="secondary">
                                {startedAtLabel}
                            </AppText>
                        </View>

                        <View style={st.headerDateItem}>
                            <AppIcon
                                id="checkmark"
                                size={14}
                                color={theme.palette.text.muted}
                            />
                            <AppText variant="bodySmall" tone="muted">
                                {t('gymSessionSummary.endedAt', {
                                    time: endedAtLabel,
                                })}
                            </AppText>
                        </View>
                    </View>
                </View>
                </ScreenSection>

                <ScreenSection
                title={t('workoutSummary.overview')}
                topSpacing="medium"
                gap={12}
            >
                <MetaCard
                    expandable={false}
                    topLeftContent={{
                        text: t('gym.sessionStats'),
                        icon: (
                            <AppIcon
                                id="stats"
                                size={14}
                                color={
                                    theme.palette.metaCard.topLeftContent.text
                                }
                            />
                        ),
                    }}
                    summaryContent={
                        <View style={st.overviewRow}>
                            {metricRows.map((row, rowIndex) => (
                                <View
                                    key={`metrics-row-${rowIndex}`}
                                    style={st.overviewMetricsRow}
                                >
                                    {row.map((metric) => (
                                        <View
                                            key={metric.key}
                                            style={st.metricCard}
                                        >
                                            <View style={st.metricLabelSlot}>
                                                <AppText
                                                    variant="caption"
                                                    tone="muted"
                                                    style={st.metricLabel}
                                                    numberOfLines={2}
                                                >
                                                    {metric.label}
                                                </AppText>
                                            </View>

                                            <AppText
                                                variant="body"
                                                tone={getMetricTone(metric)}
                                            >
                                                {metric.value}
                                            </AppText>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    }
                />
                    <ErrorBanner
                        message={actionErrorMessage}
                        onClose={() => {
                            startSessionFromPlan.reset();
                            startSessionFromSnapshot.reset();
                        }}
                    />
                </ScreenSection>

                <ScreenSection
                title={t('gymSessionSummary.exercises')}
                topSpacing="large"
                gap={theme.layout.listItem.gap}
            >
                {session.exerciseRecords.map((record, index) => {
                    const exerciseName =
                        exerciseNameById.get(record.exerciseDefinitionId) ??
                        t('common.labels.exerciseWithIndex', {
                            index: index + 1,
                        });

                    return (
                        <MetaCard
                            key={record.id}
                            expandable
                            initiallyExpanded={false}
                            withBottomFade={false}
                            minHeight={0}
                            topLeftContent={{
                                text: t('common.labels.exerciseWithIndex', {
                                    index: index + 1,
                                }),
                                icon: (
                                    <Ionicons
                                        name="barbell-outline"
                                        size={14}
                                        color={
                                            theme.palette.metaCard
                                                .topLeftContent.text
                                        }
                                    />
                                ),
                            }}
                            summaryContent={
                                <View style={st.exerciseBody}>
                                    <AppText
                                        variant="body"
                                        style={st.exerciseName}
                                        numberOfLines={2}
                                    >
                                        {exerciseName}
                                    </AppText>

                                    <View style={st.exerciseMetaRow}>
                                        <Ionicons
                                            name="repeat-outline"
                                            size={14}
                                            color={
                                                theme.palette.text.secondary
                                            }
                                        />
                                        <AppText
                                            variant="bodySmall"
                                            tone="secondary"
                                        >
                                            {t('common.units.set', {
                                                count: record.sets.length,
                                            })}
                                        </AppText>
                                    </View>
                                </View>
                            }
                            collapsibleContent={
                                <View style={st.setsContainer}>
                                    {record.sets.map((set, setIndex) => (
                                        <View key={set.id} style={st.setRow}>
                                            <View style={st.setIndexBubble}>
                                                <AppText
                                                    variant="caption"
                                                    style={st.setIndexText}
                                                >
                                                    {setIndex + 1}
                                                </AppText>
                                            </View>

                                            <View style={st.setTexts}>
                                                <AppText
                                                    variant="bodySmall"
                                                    tone="primary"
                                                >
                                                    {t(
                                                        'gymExerciseData.setWithIndex',
                                                        {
                                                            index:
                                                                setIndex + 1,
                                                        },
                                                    )}
                                                </AppText>

                                                <AppText
                                                    variant="caption"
                                                    tone="muted"
                                                    numberOfLines={2}
                                                >
                                                    {getSetDetails(set)}
                                                </AppText>
                                            </View>
                                        </View>
                                    ))}

                                    {record.sets.length === 0 && (
                                        <AppText
                                            variant="bodySmall"
                                            tone="secondary"
                                        >
                                            {t('gymExerciseData.noSetsTitle')}
                                        </AppText>
                                    )}
                                </View>
                            }
                        />
                    );
                })}

                {session.exerciseRecords.length === 0 && (
                    <AppText variant="bodySmall" tone="muted">
                        {t('gymSessionSummary.noExercises')}
                    </AppText>
                )}
                </ScreenSection>

                {session.notes && (
                    <ScreenSection
                    title={t('gymSessionSummary.notes')}
                    topSpacing="large"
                    gap={8}
                >
                    <AppText
                        variant="bodySmall"
                        tone="secondary"
                        style={st.notes}
                    >
                        {session.notes}
                    </AppText>
                    </ScreenSection>
                )}

                <ScreenSection topSpacing="medium" gap={8}>
                    <View style={st.actionsContainer}>
                        <Button
                            title={t('gymSessionSummary.actions.openGymPlan')}
                            variant="secondary"
                            onPress={handleOpenGymPlan}
                            disabled={!canOpenSourceGymPlan}
                        />

                        {!canOpenSourceGymPlan && (
                            <AppText
                                variant="bodySmall"
                                tone="secondary"
                                style={st.linkHint}
                            >
                                {t('gymSessionSummary.hints.noSourceGymPlan')}
                            </AppText>
                        )}
                    </View>
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('common.actions.back')}
                    variant="secondary"
                    onPress={() => router.back()}
                    flex={1}
                />
                <Button
                    title={t('gymSessionSummary.actions.runAgain')}
                    variant="primary"
                    onPress={handleRunAgain}
                    loading={isStartingSession}
                    flex={1}
                />
            </FooterBar>

            <ConfirmDialog
                visible={isDeleteConfirmVisible}
                title={t('gymSessionSummary.deleteConfirm.title')}
                message={t('gymSessionSummary.deleteConfirm.message')}
                confirmLabel={t('gymSessionSummary.deleteConfirm.confirm')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={handleDeleteSession}
                onCancel={() => setDeleteConfirmVisible(false)}
            />
        </>
    );
};

export default GymSessionSummaryScreen;
