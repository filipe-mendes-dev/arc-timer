import { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TrackingFieldsModal } from '@src/components/gym/TrackingFieldsModal';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';

import { DefaultFieldValueModal } from './components/DefaultFieldValueModal';
import { ExerciseDefinitionAvailabilityModal } from './components/ExerciseDefinitionAvailabilityModal';
import { ExerciseDefinitionDefaultFieldsSection } from './components/ExerciseDefinitionDefaultFieldsSection';
import { ExerciseDefinitionNameModal } from './components/ExerciseDefinitionNameModal';
import { ExerciseDefinitionOverviewSection } from './components/ExerciseDefinitionOverviewSection';
import { ExerciseDefinitionReferencesSection } from './components/ExerciseDefinitionReferencesSection';
import { ExerciseDefinitionStatsSection } from './components/ExerciseDefinitionStatsSection';
import { RecentSessionsSection } from './components/RecentSessionsSection';
import { trackingFieldsModalCopy } from './ExerciseDefinitionDetailsScreen.helpers';
import { useExerciseDefinitionDefaultFields } from './hooks/useExerciseDefinitionDefaultFields';
import { useExerciseDefinitionDetailsScreen } from './hooks/useExerciseDefinitionDetailsScreen';
import { useExerciseDefinitionDetailsScreenStyles } from './ExerciseDefinitionDetailsScreen.styles';

const ExerciseDefinitionDetailsScreen = () => {
    const { t } = useTranslation();
    const st = useExerciseDefinitionDetailsScreenStyles();
    const screen = useExerciseDefinitionDetailsScreen();
    const defaultFields = useExerciseDefinitionDefaultFields({
        definition: screen.definition,
        emptyValue: t('exerciseDefinitions.emptyValue'),
    });
    const { definition, openDeleteDialog } = screen;
    const { openTrackingFieldsModal } = defaultFields;
    const topBarOptions = useMemo<readonly TopBarOption[]>(() => {
        if (!definition) return [];

        const options: TopBarOption[] = [];

        if (definition.availability !== 'workout') {
            options.push({
                id: 'edit-exercise-definition-tracking-fields',
                label: t('exerciseDefinitions.fields.trackingFields'),
                icon: 'edit',
                onPress: openTrackingFieldsModal,
            });
        }

        if (definition.canDelete) {
            options.push({
                id: 'delete-exercise-definition',
                label: t('common.actions.remove'),
                icon: 'trash',
                destructive: true,
                onPress: openDeleteDialog,
            });
        }

        return options;
    }, [definition, openDeleteDialog, openTrackingFieldsModal, t]);

    if (screen.isNotFound || !screen.definition) {
        return (
            <MainContainer
                title={t('exerciseDefinitions.detailsTitle')}
                scroll={false}
            >
                <View style={st.center}>
                    <AppText variant="body" tone="error" style={st.errorText}>
                        {t('exerciseDefinitions.notFound')}
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
            <MainContainer
                title={screen.screenTitle}
                topBarOptions={topBarOptions}
            >
                <ExerciseDefinitionOverviewSection
                    definition={screen.definition}
                    onPressAvailability={screen.openAvailabilityModal}
                    onPressName={screen.openNameModal}
                />

                <ExerciseDefinitionReferencesSection
                    references={screen.definition.references}
                    onPressReference={screen.goToReference}
                />

                <ExerciseDefinitionDefaultFieldsSection
                    items={defaultFields.defaultMetricItems}
                    onPressField={defaultFields.openDefaultValueModal}
                />

                <ExerciseDefinitionStatsSection
                    items={screen.exerciseStatItems}
                />

                <RecentSessionsSection
                    sessions={screen.definition.recentSessions ?? []}
                    onPressSession={screen.goToRecentSession}
                />
            </MainContainer>

            <ExerciseDefinitionNameModal
                visible={screen.isNameModalVisible}
                definition={screen.definition}
                onClose={screen.closeNameModal}
            />

            <ExerciseDefinitionAvailabilityModal
                visible={screen.isAvailabilityModalVisible}
                definition={screen.definition}
                onClose={screen.closeAvailabilityModal}
            />

            <TrackingFieldsModal
                copy={trackingFieldsModalCopy}
                visible={defaultFields.isTrackingFieldsModalVisible}
                value={defaultFields.trackingFieldValue}
                fieldsWithData={defaultFields.fieldsWithDefaultData}
                isSaving={defaultFields.isSavingDefaults}
                onClose={defaultFields.closeTrackingFieldsModal}
                onSave={defaultFields.saveTrackingFields}
            />

            <DefaultFieldValueModal
                visible={!!defaultFields.editingDefaultField}
                field={defaultFields.editingDefaultField}
                isSaving={defaultFields.isSavingDefaults}
                targetSet={screen.definition.data?.defaultTargetSet}
                onClose={defaultFields.closeDefaultValueModal}
                onSave={defaultFields.saveDefaultFieldValue}
            />

            <ConfirmDialog
                visible={screen.isDeleteDialogVisible}
                title={t('exerciseDefinitions.confirmRemove.title')}
                message={
                    screen.deleteError ??
                    t('exerciseDefinitions.confirmRemove.message')
                }
                confirmLabel={t('exerciseDefinitions.confirmRemove.confirm')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={screen.confirmDelete}
                onCancel={screen.closeDeleteDialog}
            />
        </>
    );
};

export default ExerciseDefinitionDetailsScreen;
