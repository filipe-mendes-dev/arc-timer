import { View } from 'react-native';

import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { Separator } from 'src/components/ui/Separator/Separator';

import { GymActiveSessionEndModal } from './components/GymActiveSessionEndModal';
import { GymActiveSessionFooter } from './components/GymActiveSessionFooter';
import { GymActiveSessionHeader } from './components/GymActiveSessionHeader';
import { GymExerciseCard } from './components/GymExerciseCard';
import { useStyles } from './GymActiveSessionScreen.styles';
import { useGymActiveSessionScreen } from './useGymActiveSessionScreen';

const GymActiveSessionScreen = () => {
    const st = useStyles();
    const {
        activeSession,
        elapsedDuration,
        errorMessage,
        exerciseNameById,
        exerciseRecordCount,
        handleAddExercise,
        handleBack,
        handleBackToGym,
        handleCloseError,
        handleConfirmDiscard,
        handleConfirmFinish,
        handleConfirmRemoveExercise,
        handleOpenExercise,
        isDiscardingSession,
        isEndSessionModalVisible,
        isFinishingSession,
        pendingRemoveRecord,
        setCount,
        setEndSessionModalVisible,
        setPendingRemoveRecord,
        startedAtLabel,
        t,
    } = useGymActiveSessionScreen();

    if (!activeSession) {
        return (
            <MainContainer title={t('gymActiveSession.title')}>
                <ListEmptyState
                    title={t('gymActiveSession.emptyTitle')}
                    description={t('gymActiveSession.emptyDescription')}
                    actionLabel={t('gymActiveSession.actions.backToGym')}
                    onPressAction={handleBackToGym}
                />
            </MainContainer>
        );
    }

    return (
        <>
            <GymActiveSessionHeader
                elapsedDuration={elapsedDuration}
                exerciseRecordCount={exerciseRecordCount}
                setCount={setCount}
                startedAtLabel={startedAtLabel}
            />

            <Separator />

            <MainContainer hasCustomHeader gap={0} containerStyle={st.root}>
                <ErrorBanner
                    message={errorMessage}
                    onClose={handleCloseError}
                />
                <View style={st.exerciseList}>
                    {activeSession.exerciseRecords.map((record, index) => (
                        <GymExerciseCard
                            key={record.id}
                            record={record}
                            exerciseName={
                                exerciseNameById.get(
                                    record.exerciseDefinitionId,
                                ) ??
                                t('common.labels.exerciseWithIndex', {
                                    index: index + 1,
                                })
                            }
                            onPress={() => handleOpenExercise(record.id)}
                            onRemove={() => setPendingRemoveRecord(record)}
                        />
                    ))}

                    {exerciseRecordCount === 0 && (
                        <ListEmptyState
                            title={t('gymActiveSession.noExercisesTitle')}
                            description={t(
                                'gymActiveSession.noExercisesDescription',
                            )}
                        />
                    )}
                </View>

                <GymActiveSessionEndModal
                    visible={isEndSessionModalVisible}
                    isDiscardingSession={isDiscardingSession}
                    isFinishingSession={isFinishingSession}
                    onCancel={() => setEndSessionModalVisible(false)}
                    onComplete={handleConfirmFinish}
                    onDiscard={handleConfirmDiscard}
                />

                <ConfirmDialog
                    visible={pendingRemoveRecord !== null}
                    title={t('gymActiveSession.removeExerciseConfirm.title')}
                    message={t(
                        'gymActiveSession.removeExerciseConfirm.message',
                    )}
                    confirmLabel={t('gymActiveSession.actions.removeExercise')}
                    cancelLabel={t('common.actions.cancel')}
                    destructive
                    onConfirm={handleConfirmRemoveExercise}
                    onCancel={() => setPendingRemoveRecord(null)}
                />
            </MainContainer>

            <GymActiveSessionFooter
                onAddExercise={handleAddExercise}
                onBack={handleBack}
                onEnd={() => setEndSessionModalVisible(true)}
            />
        </>
    );
};

export default GymActiveSessionScreen;
