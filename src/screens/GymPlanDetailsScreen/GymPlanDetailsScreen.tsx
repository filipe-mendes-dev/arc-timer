import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { Button } from '@src/components/ui/Button/Button';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { AppText } from '@src/components/ui/Typography/AppText';
import { GymPlanSectionItem } from '@src/screens/GymPlanEditScreen/components/GymPlanSectionItem';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymPlanDetailsScreen.styles';
import { useGymPlanDetailsScreen } from './useGymPlanDetailsScreen';

const GymPlanDetailsScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const screen = useGymPlanDetailsScreen();

    if (!screen.id || !screen.gymPlan) {
        return (
            <MainContainer title={t('gymPlanDetails.title')} scroll={false}>
                <View style={st.center}>
                    <AppText variant="body" tone="error" style={st.errorText}>
                        {t('gymPlanDetails.notFound')}
                    </AppText>
                    <Button
                        title={t('common.actions.back')}
                        variant="secondary"
                        onPress={screen.goBack}
                        style={st.errorButton}
                    />
                </View>
            </MainContainer>
        );
    }

    const { gymPlan } = screen;
    let favoriteIconColor = theme.palette.text.secondary;
    let favoriteIconId: 'star' | 'starOutline' = 'starOutline';
    if (screen.isFavorite) {
        favoriteIconColor = theme.palette.accent.primary;
        favoriteIconId = 'star';
    }

    return (
        <>
            <MainContainer
                title={gymPlan.name}
                gap={0}
                topBarOptions={screen.topBarOptions}
            >
                <ScreenSection
                    title={t('gymPlanDetails.overview')}
                    topSpacing="small"
                    gap={12}
                    rightAccessory={
                        <GuardedPressable
                            onPress={screen.toggleFavoritePlan}
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
                                {t('gymPlanDetails.favorite')}
                            </AppText>
                        </GuardedPressable>
                    }
                >
                    <MetaCard
                        expandable={false}
                        topLeftContent={{
                            text: t('gymPlanDetails.cardTitle'),
                            icon: (
                                <Ionicons
                                    name="barbell-outline"
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
                                        {t('gymPlanDetails.metrics.sections')}
                                    </AppText>
                                    <AppText
                                        variant="body"
                                        style={st.metricValue}
                                    >
                                        {screen.sectionCount}
                                    </AppText>
                                </View>
                                <View style={st.metricCard}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t('gymPlanDetails.metrics.exercises')}
                                    </AppText>
                                    <AppText
                                        variant="body"
                                        style={st.metricValue}
                                    >
                                        {screen.exerciseCount}
                                    </AppText>
                                </View>
                                <View style={st.metricCardWide}>
                                    <AppText
                                        variant="caption"
                                        tone="muted"
                                        style={st.metricLabel}
                                    >
                                        {t('gymPlanDetails.metrics.targetSets')}
                                    </AppText>
                                    <AppText
                                        variant="body"
                                        style={st.metricValue}
                                    >
                                        {screen.targetSetCount}
                                    </AppText>
                                </View>
                            </View>
                        }
                    />
                    <ErrorBanner
                        message={screen.errorMessage}
                        onClose={screen.dismissError}
                        style={st.errorBanner}
                    />
                </ScreenSection>

                <ScreenSection
                    title={t('gymPlanDetails.sections')}
                    topSpacing="small"
                    gap={theme.layout.listItem.gap}
                >
                    {gymPlan.sections.map((section, sectionIndex) => (
                        <GymPlanSectionItem
                            key={section.id}
                            copyScope="details"
                            definitionNameById={screen.definitionNameById}
                            index={sectionIndex}
                            section={section}
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
                        {t('gymPlanDetails.hint')}
                    </AppText>

                    <GuardedPressable
                        onPress={screen.handleExport}
                        disabled={screen.isExporting}
                        style={st.exportContainer}
                    >
                        <CircleIconButton
                            onPress={screen.handleExport}
                            variant="secondary"
                            size={50}
                            disabled={screen.isExporting}
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
                            {t('gymPlanDetails.exportGymPlan')}
                        </AppText>
                    </GuardedPressable>
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('gymPlanDetails.actions.edit')}
                    variant="secondary"
                    onPress={screen.handleEditPlan}
                    flex={1}
                />
                <Button
                    title={t('gymPlanDetails.actions.start')}
                    variant="primary"
                    onPress={screen.handleStartPlan}
                    loading={screen.isStartingSession}
                    disabled={screen.hasArchivedStatus}
                    flex={1}
                />
            </FooterBar>

            <ConfirmDialog
                visible={screen.isDeleteConfirmVisible}
                title={t('gymPlanDetails.deleteConfirm.title')}
                message={t('gymPlanDetails.deleteConfirm.message')}
                confirmLabel={t('gymPlanDetails.deleteConfirm.confirm')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={screen.confirmDeleteGymPlan}
                onCancel={screen.closeDeleteConfirm}
            />
        </>
    );
};

export default GymPlanDetailsScreen;
