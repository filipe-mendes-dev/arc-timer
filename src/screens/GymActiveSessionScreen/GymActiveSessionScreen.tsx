import { View } from 'react-native';

import type { GymExerciseRecord } from '@src/core/entities/gymSession.interfaces';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { Separator } from 'src/components/ui/Separator/Separator';

import { GymActiveSessionEndModal } from './components/GymActiveSessionEndModal';
import { GymActiveSessionFooter } from './components/GymActiveSessionFooter';
import { GymActiveSessionHeader } from './components/GymActiveSessionHeader';
import { GymExerciseCard } from './components/GymExerciseCard';
import { useStyles } from './GymActiveSessionScreen.styles';
import { useGymActiveSessionScreen } from './useGymActiveSessionScreen';

interface SectionRecordGroup {
    id: string;
    title?: string;
    records: GymExerciseRecord[];
}

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
        hasCompletedSet,
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

    const sectionGroups = activeSession.exerciseRecords.reduce<
        SectionRecordGroup[]
    >((groups, record) => {
        const sectionKey = record.sourceGymPlanSectionId;
        if (!sectionKey) return groups;

        const existingGroup = groups.find((group) => group.id === sectionKey);
        if (existingGroup) {
            existingGroup.records.push(record);
            return groups;
        }

        groups.push({
            id: sectionKey,
            title: record.sourceGymPlanSectionTitle,
            records: [record],
        });

        return groups;
    }, []);
    const firstSectionTitle = sectionGroups[0]?.title?.trim();
    const shouldGroupBySection =
        sectionGroups.length > 1 ||
        (firstSectionTitle !== undefined && firstSectionTitle.length > 0);
    const getExerciseName = (
        record: (typeof activeSession.exerciseRecords)[number],
    ): string => {
        const recordIndex = activeSession.exerciseRecords.findIndex(
            (item) => item.id === record.id,
        );

        return (
            exerciseNameById.get(record.exerciseDefinitionId) ??
            t('common.labels.exerciseWithIndex', {
                index: recordIndex + 1,
            })
        );
    };
    const sectionedRecordIds = new Set(
        sectionGroups.flatMap((section) =>
            section.records.map((record) => record.id),
        ),
    );
    const unsectionedRecords = activeSession.exerciseRecords.filter(
        (record) => !sectionedRecordIds.has(record.id),
    );
    const shouldRenderAddedExercisesSection =
        shouldGroupBySection &&
        sectionGroups.length > 0 &&
        unsectionedRecords.length > 0;

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
                    {shouldGroupBySection &&
                        sectionGroups.map((section, sectionIndex) => {
                            const trimmedTitle = section.title?.trim();
                            let title = t('gymPlanDetails.sectionFallback', {
                                index: sectionIndex + 1,
                            });

                            if (
                                trimmedTitle !== undefined &&
                                trimmedTitle.length > 0
                            ) {
                                title = trimmedTitle;
                            }

                            return (
                                <ScreenSection
                                    key={section.id}
                                    title={title}
                                    gap={8}
                                >
                                    {section.records.map((record) => (
                                        <GymExerciseCard
                                            key={record.id}
                                            record={record}
                                            exerciseName={getExerciseName(
                                                record,
                                            )}
                                            onPress={() =>
                                                handleOpenExercise(record.id)
                                            }
                                            onRemove={() =>
                                                setPendingRemoveRecord(record)
                                            }
                                        />
                                    ))}
                                </ScreenSection>
                            );
                        })}

                    {shouldRenderAddedExercisesSection && (
                        <ScreenSection
                            title={t(
                                'gymActiveSession.sections.addedExercises',
                            )}
                            gap={8}
                        >
                            {unsectionedRecords.map((record) => (
                                <GymExerciseCard
                                    key={record.id}
                                    record={record}
                                    exerciseName={getExerciseName(record)}
                                    onPress={() =>
                                        handleOpenExercise(record.id)
                                    }
                                    onRemove={() =>
                                        setPendingRemoveRecord(record)
                                    }
                                />
                            ))}
                        </ScreenSection>
                    )}

                    {shouldGroupBySection &&
                        !shouldRenderAddedExercisesSection &&
                        unsectionedRecords.map((record) => (
                            <GymExerciseCard
                                key={record.id}
                                record={record}
                                exerciseName={getExerciseName(record)}
                                onPress={() => handleOpenExercise(record.id)}
                                onRemove={() => setPendingRemoveRecord(record)}
                            />
                        ))}

                    {!shouldGroupBySection &&
                        activeSession.exerciseRecords.map((record) => (
                            <GymExerciseCard
                                key={record.id}
                                record={record}
                                exerciseName={getExerciseName(record)}
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
                    hasCompletedSet={hasCompletedSet}
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
