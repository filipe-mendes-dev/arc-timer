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

    useSystemBackHandler({
        onSystemBack: () => true,
        isGestureBackDisabled: true,
    });

    const { data: activeGymSession } = useActiveGymSession();
    const discardGymSession = useDiscardGymSession();
    const finishGymSession = useFinishGymSession();
    const startGymSession = useStartGymSession();
    const { data: recent = [] } = useRecentTrainingSessions(5);

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
                                    icon="pulse-outline"
                                    variant="secondary"
                                    onPress={() => router.push('/gymSession')}
                                />
                            </View>

                            <View style={st.activeSessionActionItem}>
                                <HomeActionTile
                                    title={t('gym.actions.finishSession')}
                                    icon="checkmark-circle-outline"
                                    variant="secondary"
                                    onPress={() =>
                                        setEndGymSessionModalVisible(true)
                                    }
                                />
                            </View>
                        </View>
                        <Separator height={1} />
                    </>
                )}

                <HomeActionTile
                    title={t('home.actions.startHiitWorkout')}
                    subtitle={t('home.startImmediately')}
                    icon="play"
                    variant="primary"
                    onPress={startQuickHiitWorkout}
                />

                {!activeGymSession && (
                    <HomeActionTile
                        title={t('home.actions.startGymSession')}
                        subtitle={t('gym.actions.startNewSessionSubtitle')}
                        icon="pulse-outline"
                        variant="primary"
                        onPress={startOrResumeGymSession}
                    />
                )}

                <Separator height={1} />

                <View style={st.grid}>
                    <View style={st.gridItem}>
                        <HomeActionTile
                            title={t('home.actions.savedHiitWorkouts')}
                            icon="barbell-outline"
                            onPress={() => router.push('/workouts')}
                        />
                    </View>

                    <View style={st.gridItem}>
                        <HomeActionTile
                            title={t('home.actions.gymPlans')}
                            icon="fitness-outline"
                            onPress={() => router.push('/gymPlans')}
                        />
                    </View>
                </View>
            </View>

            <ScreenSection
                title={t('home.recentSessions')}
                rightAccessory={
                    <GuardedPressable
                        onPress={() => router.push('/history')}
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
                        <AppText variant="bodySmall" tone="secondary">
                            {t('home.noSessionsYet')}
                        </AppText>
                    }
                />
            </ScreenSection>

            <GymActiveSessionEndModal
                visible={isGymSessionModalVisible}
                isDiscardingSession={discardGymSession.isPending}
                isFinishingSession={
                    finishGymSession.isPending || discardGymSession.isPending
                }
                onCancel={() => setEndGymSessionModalVisible(false)}
                onComplete={handleConfirmFinish}
                onDiscard={handleConfirmDiscard}
            />
        </MainContainer>
    );
};

export default HomeScreen;
