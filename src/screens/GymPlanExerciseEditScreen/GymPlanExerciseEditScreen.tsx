import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TrackingFieldsModal } from '@src/components/gym/TrackingFieldsModal';
import { FooterBar } from '@src/components/layout/FooterBar';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { Button } from '@src/components/ui/Button/Button';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { TextField } from '@src/components/ui/TextField/TextField';
import { useTheme } from '@src/theme/ThemeProvider';

import { GymExerciseSetEditModal } from '../GymExerciseDataScreen/components/GymExerciseSetEditModal/GymExerciseSetEditModal';
import { GymPlanExerciseSetItem } from './components/GymPlanExerciseSetItem';
import { trackingFieldsModalCopy } from './GymPlanExerciseEditScreen.helpers';
import { useStyles } from './GymPlanExerciseEditScreen.style';
import { useGymPlanExerciseEditScreen } from './useGymPlanExerciseEditScreen';

const GymPlanExerciseEditScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const screen = useGymPlanExerciseEditScreen();

    if (screen.isNotFound) {
        return (
            <MainContainer
                title={t('gymPlanExerciseEdit.title')}
                scroll={false}
            >
                <View style={st.emptyBody}>
                    <ListEmptyState
                        title={t('gymPlanExerciseEdit.notFound')}
                        description={t('gymPlanBuilder.draftMissing')}
                        actionLabel={t('common.actions.back')}
                        onPressAction={screen.goBack}
                    />
                </View>
            </MainContainer>
        );
    }

    return (
        <>
            <MainContainer
                title={screen.screenTitle}
                topBarOptions={screen.topBarOptions}
                topBarLeftAction={screen.topBarLeftAction}
                topBarRightAction={screen.topBarRightAction}
            >
                <TextField
                    label={t('gymPlanExerciseEdit.exerciseName')}
                    value={screen.nameInput}
                    onChangeText={screen.handleNameChange}
                    onBlur={screen.handleNameBlur}
                    placeholder={t(
                        'gymPlanExerciseEdit.exerciseNamePlaceholder',
                    )}
                    autoCapitalize="words"
                    returnKeyType="done"
                    suggestions={screen.exerciseSuggestions}
                    onSuggestionPress={screen.handleNameSuggestionPress}
                    errorText={screen.nameError}
                />

                <ScreenSection
                    title={t('gymPlanExerciseEdit.targets')}
                    topSpacing="small"
                >
                    <View style={st.setList}>
                        {screen.targetSets.map((set, index) => (
                            <GymPlanExerciseSetItem
                                key={set.id}
                                details={screen.getSetDetails(set)}
                                index={index}
                                isSelectMode={screen.isSelectMode}
                                isSelected={screen.isSetSelected(set.id)}
                                onDelete={screen.requestDeleteSet}
                                onPress={screen.openSet}
                                set={set}
                            />
                        ))}

                        {screen.targetSets.length === 0 && (
                            <ListEmptyState
                                title={t('gymExerciseData.noSetsTitle')}
                                description={t(
                                    'gymExerciseData.noSetsDescription',
                                )}
                            />
                        )}
                    </View>

                    <Button
                        title={t('gymExerciseData.actions.addSet')}
                        variant="secondary"
                        onPress={screen.addSet}
                        icon={
                            <AppIcon
                                id="add"
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
                    onPress={screen.goBack}
                    flex={1}
                />
                <Button
                    title={t('common.actions.save')}
                    variant="primary"
                    onPress={screen.saveExercise}
                    loading={screen.isSaving}
                    flex={1}
                />
            </FooterBar>

            <TrackingFieldsModal
                copy={trackingFieldsModalCopy}
                fieldsWithData={screen.fieldsWithData}
                isSaving={false}
                value={screen.trackingFields}
                visible={screen.isTrackingFieldsModalVisible}
                onClose={screen.closeTrackingFieldsModal}
                onSave={screen.saveTrackingFields}
            />

            <GymExerciseSetEditModal
                draft={screen.editingDraft}
                isSaving={false}
                trackingFields={screen.trackingFields}
                onCancel={() => screen.setEditingDraft(null)}
                onChangeDraft={screen.updateEditingDraft}
                onSave={screen.saveSetDraft}
            />

            <ConfirmDialog
                visible={screen.pendingDeleteSets.length > 0}
                title={t('gymExerciseData.deleteConfirm.title')}
                message={t('gymExerciseData.deleteConfirm.message')}
                confirmLabel={t('gymExerciseData.actions.deleteSet')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={screen.confirmDeleteSets}
                onCancel={screen.cancelDeleteSets}
            />
        </>
    );
};

export default GymPlanExerciseEditScreen;
