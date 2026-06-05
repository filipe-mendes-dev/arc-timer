import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { FooterBar } from '@src/components/layout/FooterBar';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { TextAreaField } from '@src/components/ui/TextAreaField/TextAreaField';
import { TextField } from '@src/components/ui/TextField/TextField';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymPlanEditScreen.styles';
import { GymPlanSectionItem } from './components/GymPlanSectionItem';
import { useGymPlanEditScreen } from './useGymPlanEditScreen';
import { CollapseFade } from 'src/components/ui/CollapseFade/CollapseFade';

const GymPlanEditScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const screen = useGymPlanEditScreen();

    if (!screen.draft) {
        return (
            <MainContainer title={t('gymPlanBuilder.title')} scroll={false}>
                <View style={st.center}>
                    <AppText variant="body" tone="secondary">
                        {t('gymPlanBuilder.draftMissing')}
                    </AppText>
                    <Button
                        title={t('common.actions.back')}
                        variant="secondary"
                        onPress={screen.leaveBuilder}
                    />
                </View>
            </MainContainer>
        );
    }

    return (
        <>
            <MainContainer
                ref={screen.mainContainerRef}
                title={screen.planTitle}
                topBarOptions={screen.topBarOptions}
                gap={theme.layout.mainContainer.gap}
            >
                <View>
                    <TextField
                        label={t('gymPlanBuilder.fields.name')}
                        value={screen.planNameInput}
                        onChangeText={screen.updatePlanNameInput}
                        onBlur={screen.commitPlanNameInput}
                        placeholder={t('gymPlanBuilder.fields.namePlaceholder')}
                        errorText={screen.nameErrorMessage}
                    />
                    <CollapseFade
                        visible={screen.isNotesVisible}
                        contentStyle={st.notesContent}
                    >
                        <TextAreaField
                            label={t('gymPlanBuilder.fields.notes')}
                            value={screen.draft.description ?? ''}
                            onChangeText={screen.updateDescription}
                            placeholder={t(
                                'gymPlanBuilder.fields.descriptionPlaceholder',
                            )}
                        />
                    </CollapseFade>
                </View>

                <ScreenSection
                    title={t('gymPlanBuilder.sections.plan')}
                    gap={theme.layout.listItem.gap}
                >
                    <View>
                        <AppText variant="caption" tone="secondary">
                            {t('gymPlanBuilder.hints.tapSectionToEdit')}
                        </AppText>

                        <ErrorBanner
                            message={screen.errorMessage}
                            isDismissible
                            dismissalKey={screen.validationDismissalKey}
                            collapseContentStyle={st.errorBanner}
                        />
                    </View>

                    {screen.draft.sections.map((section, sectionIndex) => (
                        <GymPlanSectionItem
                            key={section.id}
                            definitionNameById={screen.definitionNameById}
                            index={sectionIndex}
                            section={section}
                            onPress={screen.openSection}
                            onRemove={screen.setRemoveSectionId}
                            isWiggling
                        />
                    ))}

                    <Button
                        title={t('gymPlanBuilder.actions.addSection')}
                        variant="secondary"
                        onPress={screen.addSection}
                        icon={
                            <Ionicons
                                name="add-outline"
                                size={18}
                                color={theme.palette.text.primary}
                            />
                        }
                    />
                </ScreenSection>
            </MainContainer>

            <FooterBar>
                <Button
                    title={t('common.actions.cancel')}
                    variant="secondary"
                    onPress={() => screen.setLeaveConfirmVisible(true)}
                    flex={1}
                />
                <Button
                    title={t('gymPlanBuilder.actions.save')}
                    variant="primary"
                    onPress={screen.saveDraft}
                    loading={screen.isSaving}
                    flex={1}
                />
            </FooterBar>

            <ConfirmDialog
                visible={screen.isLeaveConfirmVisible}
                title={t('gymPlanBuilder.discardConfirm.title')}
                message={t('gymPlanBuilder.discardConfirm.message')}
                confirmLabel={t('gymPlanBuilder.discardConfirm.confirm')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={screen.confirmDiscardAndLeave}
                onCancel={screen.cancelLeave}
            />

            <ConfirmDialog
                visible={screen.removeSectionId !== null}
                title={t('gymPlanBuilder.removeSectionConfirm.title')}
                message={t('gymPlanBuilder.removeSectionConfirm.message')}
                confirmLabel={t('common.actions.remove')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={screen.confirmRemoveSection}
                onCancel={() => screen.setRemoveSectionId(null)}
            />
        </>
    );
};

export default GymPlanEditScreen;
