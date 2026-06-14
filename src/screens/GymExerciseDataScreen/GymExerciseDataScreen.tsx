import type { ReactElement } from 'react';
import { FlatList, View } from 'react-native';

import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import {
    TrackingFieldsModal,
    type TrackingFieldsModalCopy,
} from '@src/components/gym/TrackingFieldsModal';
import { ScreenShell } from '@src/components/layout/ScreenShell';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { DropdownPortalProvider } from '@src/components/ui/Dropdown/DropdownPortal';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { Separator } from '@src/components/ui/Separator/Separator';
import { Button } from '@src/components/ui/Button/Button';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';

import { GymExerciseDataFooter } from './components/GymExerciseDataFooter';
import { GymExerciseDataHeader } from './components/GymExerciseDataHeader';
import { GymExerciseSetEditModal } from './components/GymExerciseSetEditModal/GymExerciseSetEditModal';
import GymExerciseSetLine from './components/GymExerciseSetLine/GymExerciseSetLine';
import { useStyles } from './GymExerciseDataScreen.styles';
import { useGymExerciseDataScreen } from './useGymExerciseDataScreen';

const trackingFieldsModalCopy: TrackingFieldsModalCopy = {
    description: 'gymExerciseData.defaults.description',
    removeDataAndSave: 'gymExerciseData.defaults.removeDataAndSave',
    removeDataWarning: 'gymExerciseData.defaults.removeDataWarning',
    title: 'gymExerciseData.defaults.title',
};

const GymExerciseDataScreen = () => {
    const st = useStyles();
    const { theme } = useTheme();
    const screen = useGymExerciseDataScreen();
    let completedActionFooter: ReactElement | null = null;

    if (screen.isExerciseComplete && !screen.isSelectMode) {
        completedActionFooter = (
            <View style={st.completedActionContainer}>
                <Button
                    title={screen.t('gymExerciseData.actions.backToSession')}
                    onPress={screen.handleBackToSession}
                    icon={
                        <AppIcon
                            id="checkmarkCircle"
                            size={20}
                            color={theme.palette.text.inverted}
                        />
                    }
                />
            </View>
        );
    }

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
                    elapsedDuration={screen.elapsedDuration}
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
                    ListHeaderComponentStyle={st.errorBanner}
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
                    ListFooterComponent={completedActionFooter}
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

                <TrackingFieldsModal
                    copy={trackingFieldsModalCopy}
                    fieldsWithData={screen.fieldsWithData}
                    isSaving={screen.isSavingSet}
                    value={screen.trackingFields}
                    visible={screen.isTrackingFieldsModalVisible}
                    onClose={screen.closeTrackingFieldsModal}
                    onSave={screen.handleSaveTrackingFields}
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
                    confirmLabel={screen.t('gymExerciseData.actions.deleteSet')}
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
