import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { Button } from '@src/components/ui/Button/Button';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { WorkoutBlockItem } from '@src/screens/EditWorkoutScreen/components/WorkoutBlockItem/WorkoutBlockItem';
import { useTheme } from '@src/theme/ThemeProvider';

import { useWorkoutSummaryStyles } from './WorkoutSummaryScreen.styles';
import { useWorkoutSummaryScreen } from './useWorkoutSummaryScreen';

const WorkoutSummaryScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useWorkoutSummaryStyles();
    const screen = useWorkoutSummaryScreen();

    if (!screen.id || !screen.workout) {
        return (
            <MainContainer title={t('workoutSummary.title')} scroll={false}>
                <View style={st.center}>
                    <AppText variant="body" tone="error" style={st.errorText}>
                        {t('workoutSummary.notFound')}
                    </AppText>
                    <Button
                        title={t('common.actions.back')}
                        variant="secondary"
                        onPress={screen.handleBack}
                        style={st.errorButton}
                    />
                </View>
            </MainContainer>
        );
    }

    const { summary, workout } = screen;
    let favoriteIconColor = theme.palette.text.secondary;
    let favoriteIconId: 'star' | 'starOutline' = 'starOutline';
    if (screen.isFavorite) {
        favoriteIconColor = theme.palette.accent.primary;
        favoriteIconId = 'star';
    }

    return (
        <>
            <MainContainer
                title={workout.name}
                gap={0}
                topBarOptions={screen.topBarOptions}
            >
                <ScreenSection
                    title={t('workoutSummary.overview')}
                    topSpacing="small"
                    gap={12}
                    rightAccessory={
                        <GuardedPressable
                            onPress={screen.toggleFavoriteWorkout}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={st.favoriteToggle}
                        >
                            <AppIcon
                                id={favoriteIconId}
                                size={20}
                                color={favoriteIconColor}
                            />
                            <AppText
                                variant="bodySmall"
                                style={[
                                    st.favoriteLabel,
                                    screen.isFavorite && st.favoriteLabelActive,
                                ]}
                            >
                                {t('workoutSummary.favorite')}
                            </AppText>
                        </GuardedPressable>
                    }
                >
                    <MetaCard
                        expandable={false}
                        topLeftContent={{
                            text: t('workoutSummary.cardTitle'),
                            icon: (
                                <AppIcon
                                    id="workout"
                                    size={14}
                                    color={
                                        theme.palette.metaCard.topLeftContent
                                            .text
                                    }
                                />
                            ),
                            backgroundColor:
                                theme.palette.metaCard.topLeftContent
                                    .background,
                            color: theme.palette.metaCard.topLeftContent.text,
                            borderColor:
                                theme.palette.metaCard.topLeftContent.border,
                        }}
                        summaryContent={
                            <View style={st.overviewRow}>
                                <View style={st.metricCard}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t('workoutSummary.metrics.blocks')}
                                    </AppText>
                                    <AppText
                                        variant="body"
                                        style={st.metricValue}
                                    >
                                        {summary.blocks}
                                    </AppText>
                                </View>

                                <View style={st.metricCard}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t('workoutSummary.metrics.exercises')}
                                    </AppText>
                                    <AppText
                                        variant="body"
                                        style={st.metricValue}
                                    >
                                        {summary.exercises}
                                    </AppText>
                                </View>

                                <View style={st.metricCardWide}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t(
                                            'workoutSummary.metrics.estimatedTime',
                                        )}
                                    </AppText>
                                    <AppText
                                        variant="bodySmall"
                                        style={st.metricValue}
                                        numberOfLines={2}
                                    >
                                        {screen.timeLabel}
                                    </AppText>
                                </View>
                            </View>
                        }
                    />

                    <ErrorBanner
                        message={screen.exportError}
                        onClose={screen.resetExportError}
                    />
                </ScreenSection>

                <ScreenSection
                    title={t('workoutSummary.blocksSection')}
                    topSpacing="medium"
                    gap={theme.layout.listItem.gap}
                >
                    {workout.blocks.map((block, index) => (
                        <WorkoutBlockItem
                            key={block.id}
                            index={index}
                            block={block}
                            onExercisePress={
                                screen.handleOpenExerciseDefinition
                            }
                        />
                    ))}
                </ScreenSection>

                <ScreenSection topSpacing="medium" gap={8}>
                    <AppText
                        variant="caption"
                        tone="muted"
                        style={st.hint}
                        numberOfLines={2}
                    >
                        {t('workoutSummary.hint')}
                    </AppText>

                    <GuardedPressable
                        onPress={screen.handleExport}
                        disabled={screen.exporting}
                        style={st.exportContainer}
                    >
                        <CircleIconButton
                            onPress={screen.handleExport}
                            variant="secondary"
                            size={50}
                            disabled={screen.exporting}
                            style={st.exportButton}
                        >
                            <Ionicons
                                name="share-outline"
                                size={24}
                                color={theme.palette.text.primary}
                            />
                        </CircleIconButton>
                        <AppText
                            variant="bodySmall"
                            tone="muted"
                            style={st.exportText}
                        >
                            {t('workoutSummary.exportWorkout')}
                        </AppText>
                    </GuardedPressable>
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('workoutSummary.actions.edit')}
                    variant="secondary"
                    flex={1}
                    onPress={screen.handleEditWorkout}
                />
                <Button
                    title={t('workoutSummary.actions.start')}
                    variant="primary"
                    flex={1}
                    onPress={screen.handleStartWorkout}
                />
            </FooterBar>

            <ConfirmDialog
                visible={screen.confirmRemoveVisible}
                title={t('workouts.confirmRemove.title')}
                message={t('workouts.confirmRemove.message')}
                confirmLabel={t('workouts.confirmRemove.confirm')}
                cancelLabel={t('workouts.confirmRemove.cancel')}
                destructive
                onConfirm={screen.handleRemoveWorkout}
                onCancel={screen.closeRemoveConfirm}
            />
        </>
    );
};

export default WorkoutSummaryScreen;
