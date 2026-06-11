import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FooterBar } from '@src/components/layout/FooterBar';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { Button } from '@src/components/ui/Button/Button';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { TextField } from '@src/components/ui/TextField/TextField';
import { AppText } from '@src/components/ui/Typography/AppText';
import { isPlaceholderGymPlanExercise } from '@src/core/gyms/gymPlanDrafts';
import { useTheme } from '@src/theme/ThemeProvider';

import { GymPlanExerciseCard } from './components/GymPlanExerciseCard';
import { useStyles } from './GymPlanSectionEditScreen.styles';
import { useGymPlanSectionEditScreen } from './useGymPlanSectionEditScreen';

const GymPlanSectionEditScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStyles();
    const screen = useGymPlanSectionEditScreen();

    if (!screen.sectionDraft) {
        return (
            <MainContainer
                title={t('gymPlanBuilder.sectionEditor.title')}
                scroll={false}
            >
                <View style={st.center}>
                    <AppText variant="body" tone="secondary">
                        {t('gymPlanBuilder.sectionEditor.notFound')}
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

    return (
        <>
            <MainContainer title={screen.sectionLabel}>
                <TextField
                    label={t('gymPlanBuilder.fields.sectionTitle')}
                    value={screen.sectionTitleInput}
                    onChangeText={screen.updateSectionTitleInput}
                    onBlur={screen.commitSectionTitleInput}
                    placeholder={t('gymPlanBuilder.sectionFallback', {
                        index: screen.sectionDraft.sortIndex + 1,
                    })}
                />

                <ScreenSection
                    title={t('gymPlanBuilder.sectionEditor.exercises')}
                    topSpacing="small"
                    gap={12}
                >
                    <AppText variant="caption" tone="secondary">
                        {t('gymPlanBuilder.sectionEditor.tapExerciseToEdit')}
                    </AppText>

                    {screen.sectionDraft.exercises.map(
                        (exercise, exerciseIndex) => {
                            let exerciseName = '';
                            if (!isPlaceholderGymPlanExercise(exercise)) {
                                exerciseName =
                                    screen.definitionNameById.get(
                                        exercise.exerciseDefinitionId,
                                    ) ??
                                    t('gymPlanBuilder.exerciseFallback', {
                                        index: exerciseIndex + 1,
                                    });
                            }

                            return (
                                <GymPlanExerciseCard
                                    key={exercise.id}
                                    definitionName={exerciseName}
                                    exercise={exercise}
                                    index={exerciseIndex}
                                    onPress={() =>
                                        screen.openExercise(exercise.id)
                                    }
                                    onRemove={() =>
                                        screen.requestRemoveExercise(
                                            exercise.id,
                                        )
                                    }
                                    isWiggling
                                />
                            );
                        },
                    )}

                    <Button
                        title={t('gymPlanBuilder.actions.addExercise')}
                        variant="secondary"
                        onPress={screen.addExercise}
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
                    title={t('gymPlanBuilder.actions.saveSection')}
                    variant="primary"
                    onPress={screen.saveSection}
                    loading={screen.isSaving}
                    flex={1}
                />
            </FooterBar>

            <ConfirmDialog
                visible={screen.exerciseIdToRemove !== null}
                title={t('gymPlanBuilder.removeExerciseConfirm.title')}
                message={t('gymPlanBuilder.removeExerciseConfirm.message')}
                confirmLabel={t('common.actions.remove')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={screen.confirmRemoveExercise}
                onCancel={screen.cancelRemoveExercise}
            />
        </>
    );
};

export default GymPlanSectionEditScreen;
