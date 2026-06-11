import { View } from 'react-native';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { GymSessionSectionItem } from './components/GymSessionSectionItem';
import { getMetricTone } from './GymSessionSummaryScreen.helpers';
import { useStyles } from './GymSessionSummaryScreen.styles';
import { useGymSessionSummaryScreen } from './useGymSessionSummaryScreen';

const GymSessionSummaryScreen = () => {
    const { theme } = useTheme();
    const st = useStyles();
    const {
        actionErrorMessage,
        canOpenSourceGymPlan,
        endedAtLabel,
        exerciseSummaries,
        getSetDetails,
        handleDeleteSession,
        handleOpenExerciseDefinition,
        handleOpenGymPlan,
        handleRunAgain,
        isDeleteConfirmVisible,
        isStartingSession,
        metricRows,
        resetActionError,
        router,
        sectionSummaries,
        session,
        setDeleteConfirmVisible,
        sourceGymPlanTitle,
        startedAtLabel,
        t,
    } = useGymSessionSummaryScreen();

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

    return (
        <>
            <MainContainer
                title={sourceGymPlanTitle ?? t('gymSessionSummary.title')}
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
                    <View>
                        <View style={st.headerContainer}>
                            <AppText
                                variant="title2"
                                numberOfLines={2}
                                style={st.headerTitle}
                            >
                                {sourceGymPlanTitle ??
                                    t('gymHistory.sessionTitle')}
                            </AppText>

                            <View style={st.headerDateRow}>
                                <View style={st.headerDateItem}>
                                    <AppIcon
                                        id="calendar"
                                        size={14}
                                        color={theme.palette.text.secondary}
                                    />
                                    <AppText
                                        variant="bodySmall"
                                        tone="secondary"
                                    >
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
                        <ErrorBanner
                            message={actionErrorMessage}
                            onClose={resetActionError}
                            collapseContentStyle={st.errorBanner}
                        />
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
                            text: t('workoutSummary.overview'),
                            icon: (
                                <AppIcon
                                    id="stats"
                                    size={14}
                                    color={
                                        theme.palette.metaCard.topLeftContent
                                            .text
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
                                                <View
                                                    style={st.metricLabelSlot}
                                                >
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
                </ScreenSection>

                <ScreenSection
                    title={t('gymSessionSummary.exercises')}
                    topSpacing="large"
                    gap={theme.layout.listItem.gap}
                >
                    {sectionSummaries.map((section) => (
                        <GymSessionSectionItem
                            key={section.id}
                            section={section}
                            getSetDetails={getSetDetails}
                            onExercisePress={handleOpenExerciseDefinition}
                        />
                    ))}

                    {exerciseSummaries.length === 0 && (
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
