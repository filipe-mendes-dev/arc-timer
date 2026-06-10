import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { AppText } from '@src/components/ui/Typography/AppText';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { HomeActionTile } from './components/HomeActionTile/HomeActionTile';
import { useStyles } from './HomeScreen.styles';
import { useTheme } from '@src/theme/ThemeProvider';
import { useWorkoutDraftStore } from '@src/state/stores/useWorkoutDraftStore';
import {
    useActiveGymSession,
    useDiscardGymSession,
    useFinishGymSession,
    useStartGymSession,
} from '@src/data/gymSessions';
import { useRecentTrainingSessions } from '@src/data/trainingSessions';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { TrainingSessionListItem } from '../HistoryScreen/components/TrainingSessionListItem';
import { AppLogo } from '@src/components/ui/AppLogo/AppLogo';
import { useTranslation } from 'react-i18next';
import { useSystemBackHandler } from '@src/hooks/navigation/useSystemBackHandler';
import type {
    TrainingSessionKind,
    TrainingSessionListItem as TrainingSessionListItemEntity,
} from '@src/core/entities/trainingSession.interfaces';
import { useState } from 'react';
import { GymActiveSessionEndModal } from '../GymActiveSessionScreen/components/GymActiveSessionEndModal';
import { Separator } from 'src/components/ui/Separator/Separator';
import { ActionModal } from '@src/components/modals/ActionModal';
import { ListEmptyState } from 'src/components/layout/ListEmptyState';

const getSessionRoute = (
    kind: TrainingSessionKind,
    sessionId: string,
): `/history/${string}` | `/gymHistory/${string}` => {
    if (kind === 'hiit') return `/history/${sessionId}`;

    return `/gymHistory/${sessionId}`;
};

const HomeScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { theme } = useTheme();
    const st = useStyles();

    const [isGymSessionModalVisible, setEndGymSessionModalVisible] =
        useState(false);
    const [isSessionTypeModalVisible, setSessionTypeModalVisible] =
        useState(false);

    useSystemBackHandler({
        onSystemBack: () => true,
        isGestureBackDisabled: true,
    });

    const { data: activeGymSession } = useActiveGymSession();
    const discardGymSession = useDiscardGymSession();
    const finishGymSession = useFinishGymSession();
    const startGymSession = useStartGymSession();
    const { data: recent = [] } = useRecentTrainingSessions(5);
    const hasCompletedGymSessionSet =
        activeGymSession?.exerciseRecords.some((record) =>
            record.sets.some((set) => set.completedAtMs !== undefined),
        ) ?? false;

    const onOpenSession = (session: TrainingSessionListItemEntity) => {
        router.push(getSessionRoute(session.kind, session.id));
    };

    const startQuickHiitWorkout = () => {
        useWorkoutDraftStore.getState().startDraftQuick();

        const firstBlock = useWorkoutDraftStore.getState().draft?.blocks[0];
        if (!firstBlock) return;

        router.push(`/workouts/edit-block?blockId=${firstBlock.id}&quick=1`);
    };

    const startOrResumeGymSession = () => {
        if (activeGymSession) {
            router.push('/gymSession');
            return;
        }

        startGymSession.mutate(undefined, {
            onSuccess: () => router.push('/gymSession'),
        });
    };

    const handleStartWorkoutSession = () => {
        setSessionTypeModalVisible(false);
        startQuickHiitWorkout();
    };

    const handleStartGymSession = () => {
        setSessionTypeModalVisible(false);
        startOrResumeGymSession();
    };

    const handleConfirmFinish = () => {
        finishGymSession.mutate(undefined, {
            onSuccess: (session) => {
                setEndGymSessionModalVisible(false);
                router.push(`/gymHistory/${session.id}`);
            },
        });
    };

    const handleConfirmDiscard = () => {
        if (!activeGymSession) return;

        discardGymSession.mutate(activeGymSession.id, {
            onSuccess: () => setEndGymSessionModalVisible(false),
        });
    };

    return (
        <MainContainer
            title={t('home.title')}
            gap={theme.layout.mainContainer.gap}
            scroll={false}
        >
            <View style={st.headerContainer}>
                <AppLogo size={60} />
                <View style={st.headerTextContainer}>
                    <AppText variant="title1" style={st.heading}>
                        {t('home.welcome')}
                    </AppText>

                    <AppText
                        variant="bodySmall"
                        tone="secondary"
                        style={st.subheading}
                    >
                        {t('home.subtitle')}
                    </AppText>
                </View>
            </View>

            <View style={st.gridContainer}>
                {activeGymSession && (
                    <>
                        <View style={st.activeSessionActions}>
                            <View style={st.activeSessionActionItem}>
                                <HomeActionTile
                                    title={t('gym.actions.resumeSession')}
                                    icon="gymSession"
                                    variant="secondary"
                                    onPress={() => router.push('/gymSession')}
                                />
                            </View>

                            <View style={st.activeSessionActionItem}>
                                <HomeActionTile
                                    title={t('gym.actions.finishSession')}
                                    icon="checkmarkCircle"
                                    variant="secondary"
                                    onPress={() =>
                                        setEndGymSessionModalVisible(true)
                                    }
                                />
                            </View>
                        </View>
                    </>
                )}

                {!activeGymSession && (
                    <HomeActionTile
                        title={t('home.quickSession')}
                        subtitle={t('home.startImmediately')}
                        icon="quickSession"
                        variant="primary"
                        onPress={() => setSessionTypeModalVisible(true)}
                    />
                )}
            </View>

            <Separator height={1} />

            <ScreenSection title={t('home.quickAccess')}>
                <View style={st.grid}>
                    <View style={st.gridItem}>
                        <HomeActionTile
                            title={t('home.actions.savedHiitWorkouts')}
                            icon="workout"
                            onPress={() => router.navigate('/workouts')}
                        />
                    </View>

                    <View style={st.gridItem}>
                        <HomeActionTile
                            title={t('home.actions.gymPlans')}
                            icon="gymPlan"
                            onPress={() => router.push('/gymPlans')}
                        />
                    </View>
                </View>
            </ScreenSection>

            <Separator height={1} />

            <ScreenSection
                title={t('home.recentSessions')}
                rightAccessory={
                    <GuardedPressable
                        onPress={() => router.navigate('/history')}
                        style={st.recentSessionsButton}
                        hitSlop={8}
                    >
                        <AppText
                            variant="bodySmall"
                            numberOfLines={1}
                            style={st.recentSessionsButtonText}
                        >
                            {t('home.actions.seeAllSessions')}
                        </AppText>
                        <AppIcon
                            id="forwardCircle"
                            size={14}
                            color={theme.palette.text.secondary}
                        />
                    </GuardedPressable>
                }
                flex
            >
                <FlatList
                    data={recent}
                    keyExtractor={(s) => `${s.kind}:${s.id}`}
                    contentContainerStyle={st.listContent}
                    style={st.list}
                    renderItem={({ item }) => (
                        <TrainingSessionListItem
                            session={item}
                            onPress={() => onOpenSession(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <ListEmptyState
                            title={t('history.emptyTitle')}
                            description={t('history.emptyDescription')}
                            size="small"
                        />
                    }
                />
            </ScreenSection>

            <GymActiveSessionEndModal
                visible={isGymSessionModalVisible}
                hasCompletedSet={hasCompletedGymSessionSet}
                isDiscardingSession={discardGymSession.isPending}
                isFinishingSession={
                    finishGymSession.isPending || discardGymSession.isPending
                }
                onCancel={() => setEndGymSessionModalVisible(false)}
                onComplete={handleConfirmFinish}
                onDiscard={handleConfirmDiscard}
            />

            <ActionModal
                visible={isSessionTypeModalVisible}
                style={st.sessionTypeModal}
                title={t('home.sessionTypeModal.title')}
                description={t('home.sessionTypeModal.description')}
                onClose={() => setSessionTypeModalVisible(false)}
            >
                <View style={st.sessionTypeTiles}>
                    <HomeActionTile
                        title={t('home.actions.startHiitWorkout')}
                        icon="workout"
                        variant="primary"
                        onPress={handleStartWorkoutSession}
                    />

                    <HomeActionTile
                        title={t('home.actions.startGymSession')}
                        icon="gymSession"
                        variant="secondary"
                        onPress={handleStartGymSession}
                    />
                </View>
            </ActionModal>
        </MainContainer>
    );
};

export default HomeScreen;
