import { View } from 'react-native';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { Separator } from '@src/components/ui/Separator/Separator';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { HomeActionTile } from '@src/screens/HomeScreen/components/HomeActionTile/HomeActionTile';

import { useStyles } from './GymScreen.styles';
import { useGymScreen } from './useGymScreen';

const GymScreen = () => {
    const { theme } = useTheme();
    const st = useStyles();
    const {
        activeSession,
        activeSessionSetCount,
        discardGymSession,
        errorMessage,
        finishGymSession,
        handleCloseError,
        handleConfirmDiscard,
        handleConfirmFinish,
        handleStartSession,
        isFinishModalVisible,
        isFinishingSession,
        router,
        setFinishModalVisible,
        startedAtLabel,
        t,
    } = useGymScreen();

    return (
        <MainContainer
            title={t('gym.title')}
            gap={theme.layout.mainContainer.gap}
        >
            <View style={st.intro}>
                <AppText variant="title1" style={st.title}>
                    {t('gym.heading')}
                </AppText>

                <AppText
                    variant="bodySmall"
                    tone="secondary"
                    style={st.description}
                >
                    {t('gym.subtitle')}
                </AppText>
            </View>

            <View style={st.actions}>
                {!activeSession && (
                    <HomeActionTile
                        title={t('gym.actions.startNewSession')}
                        subtitle={t('gym.actions.startNewSessionSubtitle')}
                        icon="play"
                        variant="primary"
                        onPress={handleStartSession}
                    />
                )}

                {activeSession && (
                    <View style={st.activeActions}>
                        <View style={st.activeActionItem}>
                            <HomeActionTile
                                title={t('gym.actions.resumeSession')}
                                icon="pulse-outline"
                                variant="secondary"
                                onPress={() => router.push('/gymSession')}
                            />
                        </View>

                        <View style={st.activeActionItem}>
                            <HomeActionTile
                                title={t('gym.actions.finishSession')}
                                icon="checkmark-circle-outline"
                                variant="secondary"
                                onPress={() => setFinishModalVisible(true)}
                            />
                        </View>
                    </View>
                )}

                {activeSession && (
                    <ScreenSection title={t('gym.currentSession')}>
                        <MetaCard
                            expandable={false}
                            topLeftContent={{
                                text: t('gym.sessionStats'),
                                icon: (
                                    <AppIcon
                                        id="stats"
                                        size={14}
                                        color={
                                            theme.palette.metaCard
                                                .topLeftContent.text
                                        }
                                    />
                                ),
                                backgroundColor:
                                    theme.palette.metaCard.topLeftContent
                                        .background,
                                color: theme.palette.metaCard.topLeftContent
                                    .text,
                                borderColor:
                                    theme.palette.metaCard.topLeftContent
                                        .border,
                            }}
                            summaryContent={
                                <View style={st.overviewMetricsRow}>
                                    <View style={st.metricCard}>
                                        <View style={st.metricLabelSlot}>
                                            <AppText
                                                variant="caption"
                                                tone="muted"
                                                style={st.metricLabel}
                                                numberOfLines={2}
                                            >
                                                {t(
                                                    'gymActiveSession.startedAt',
                                                )}
                                            </AppText>
                                        </View>

                                        <AppText variant="body">
                                            {startedAtLabel}
                                        </AppText>
                                    </View>

                                    <View style={st.metricCard}>
                                        <View style={st.metricLabelSlot}>
                                            <AppText
                                                variant="caption"
                                                tone="muted"
                                                style={st.metricLabel}
                                                numberOfLines={2}
                                            >
                                                {t(
                                                    'gymActiveSession.exercises',
                                                )}
                                            </AppText>
                                        </View>

                                        <AppText variant="body">
                                            {
                                                activeSession.exerciseRecords
                                                    .length
                                            }
                                        </AppText>
                                    </View>

                                    <View style={st.metricCard}>
                                        <View style={st.metricLabelSlot}>
                                            <AppText
                                                variant="caption"
                                                tone="muted"
                                                style={st.metricLabel}
                                                numberOfLines={2}
                                            >
                                                {t('run.stats.sets')}
                                            </AppText>
                                        </View>

                                        <AppText variant="body">
                                            {activeSessionSetCount}
                                        </AppText>
                                    </View>
                                </View>
                            }
                        />
                    </ScreenSection>
                )}

                <Separator />

                <HomeActionTile
                    title={t('gym.actions.plans')}
                    subtitle={t('gym.actions.plansSubtitle')}
                    icon="barbell-outline"
                    variant="secondary"
                    onPress={() => router.push('/gymPlans')}
                />

                <HomeActionTile
                    title={t('gym.actions.history')}
                    subtitle={t('gym.actions.historySubtitle')}
                    icon="time-outline"
                    variant="secondary"
                    onPress={() => router.push('/gymHistory')}
                />

                <ErrorBanner
                    message={errorMessage}
                    onClose={handleCloseError}
                    style={st.errorBanner}
                />
            </View>

            <Modal
                visible={isFinishModalVisible}
                onRequestClose={() => setFinishModalVisible(false)}
                containerStyle={st.modalContainer}
                contentStyle={st.modalContent}
            >
                <View style={st.modalBody}>
                    <View style={st.modalTextContainer}>
                        <AppText variant="title3" style={st.modalTitle}>
                            {t('gym.finishSessionModal.title')}
                        </AppText>

                        <AppText
                            variant="bodySmall"
                            tone="secondary"
                            style={st.modalMessage}
                        >
                            {t('gym.finishSessionModal.message')}
                        </AppText>
                    </View>

                    <View style={st.modalActions}>
                        <Button
                            title={t('gym.finishSessionModal.complete')}
                            variant="primary"
                            loading={finishGymSession.isPending}
                            disabled={discardGymSession.isPending}
                            onPress={handleConfirmFinish}
                        />

                        <Button
                            title={t('gym.finishSessionModal.discard')}
                            variant="danger"
                            loading={discardGymSession.isPending}
                            disabled={finishGymSession.isPending}
                            onPress={handleConfirmDiscard}
                        />

                        <GuardedPressable
                            disabled={isFinishingSession}
                            style={st.cancelButton}
                            onPress={() => setFinishModalVisible(false)}
                        >
                            <AppText variant="bodySmall" tone="muted">
                                {t('common.actions.cancel')}
                            </AppText>
                        </GuardedPressable>
                    </View>
                </View>
            </Modal>
        </MainContainer>
    );
};

export default GymScreen;
