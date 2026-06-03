import { FlatList, View } from 'react-native';

import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { ScreenShell } from '@src/components/layout/ScreenShell';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { DropdownPortalProvider } from '@src/components/ui/Dropdown/DropdownPortal';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { Separator } from '@src/components/ui/Separator/Separator';

import { GymExerciseDataFooter } from './components/GymExerciseDataFooter';
import { GymExerciseDataHeader } from './components/GymExerciseDataHeader';
import { GymExerciseSetEditModal } from './components/GymExerciseSetEditModal/GymExerciseSetEditModal';
import GymExerciseSetLine from './components/GymExerciseSetLine/GymExerciseSetLine';
import { GymExerciseTrackingFieldsModal } from './components/GymExerciseTrackingFieldsModal/GymExerciseTrackingFieldsModal';
import { useStyles } from './GymExerciseDataScreen.styles';
import { useGymExerciseDataScreen } from './useGymExerciseDataScreen';

const GymExerciseDataScreen = () => {
    const st = useStyles();
    const screen = useGymExerciseDataScreen();

    if (!screen.record) {
        return (
            <ScreenShell hasTopBar={false}>
                <View style={st.emptyBody}>
                    <ListEmptyState
                        title={screen.t('gymExerciseData.notFoundTitle')}
                        description={screen.t(
                            'gymExerciseData.notFoundDescription',
                        )}
                        actionLabel={screen.t(
                            'gymExerciseData.actions.backToSession',
                        )}
                        onPressAction={screen.handleBackToSession}
                    />
                </View>
            </ScreenShell>
        );
    }

    return (
        <DropdownPortalProvider>
            <View style={st.screen}>
                <GymExerciseDataHeader
                    completedSetCount={screen.completedSetCount}
                    exerciseName={screen.exerciseName}
                    isSelectMode={screen.isSelectMode}
                    selectedCount={screen.selectedCount}
                    setCount={screen.sets.length}
                />

                <Separator />

                <FlatList
                    data={screen.sets}
                    keyExtractor={(set) => set.id}
                    renderItem={({ item, index }) => (
                        <GymExerciseSetLine
                            details={screen.getSetDetails(item)}
                            index={index}
                            isCompleted={item.completedAtMs !== undefined}
                            isCompleting={screen.isCompletingSet(item)}
                            isDeleting={screen.isDeletingSet(item)}
                            isSelectMode={screen.isSelectMode}
                            isSelected={screen.isSelected(item.id)}
                            onDelete={screen.handleRequestDeleteSet}
                            onEdit={screen.handleEditSet}
                            onSelect={screen.handleSelectSet}
                            onToggleComplete={screen.handleToggleCompleteSet}
                            set={item}
                        />
                    )}
                    style={st.list}
                    contentContainerStyle={st.listContent}
                    ListHeaderComponent={
                        <ErrorBanner
                            message={screen.errorMessage}
                            onClose={screen.handleCloseError}
                        />
                    }
                    ListEmptyComponent={
                        <ListEmptyState
                            title={screen.t('gymExerciseData.noSetsTitle')}
                            description={screen.t(
                                'gymExerciseData.noSetsDescription',
                            )}
                        />
                    }
                    keyboardShouldPersistTaps="handled"
                />

                <GymExerciseDataFooter
                    hasSelection={screen.hasSelection}
                    isAddingSet={screen.isAddingSet}
                    isSelectMode={screen.isSelectMode}
                    onAddSet={screen.handleAddSet}
                    onBack={screen.handleBack}
                    onDeleteSelected={screen.handleRequestSelectedDelete}
                    onEnterSelectMode={screen.enterSelectMode}
                    onExitSelectMode={screen.exitSelectMode}
                    onSelectAll={screen.selectAllSets}
                    onTrackingFields={screen.openTrackingFieldsModal}
                />

                <GymExerciseTrackingFieldsModal
                    trackingFields={screen.trackingFields}
                    visible={screen.isTrackingFieldsModalVisible}
                    onClose={screen.closeTrackingFieldsModal}
                    onToggleField={screen.updateTrackingField}
                />

                <GymExerciseSetEditModal
                    draft={screen.editingDraft}
                    isSaving={screen.isSavingSet}
                    trackingFields={screen.trackingFields}
                    onCancel={() => screen.setEditingDraft(null)}
                    onChangeDraft={screen.setEditingDraft}
                    onSave={screen.handleSaveDraft}
                />

                <ConfirmDialog
                    visible={screen.pendingDeleteSets.length > 0}
                    title={screen.deleteConfirmTitle}
                    message={screen.deleteConfirmMessage}
                    confirmLabel={screen.t(
                        'gymExerciseData.actions.deleteSet',
                    )}
                    cancelLabel={screen.t('common.actions.cancel')}
                    destructive
                    onConfirm={screen.handleConfirmDeleteSets}
                    onCancel={screen.handleCancelDeleteSets}
                />
            </View>
        </DropdownPortalProvider>
    );
};

export default GymExerciseDataScreen;
