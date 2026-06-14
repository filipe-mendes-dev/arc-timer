import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { TextField } from '@src/components/ui/TextField/TextField';
import type { TextFieldSuggestionItem } from '@src/components/ui/TextField/TextField.interfaces';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { ExerciseDefinitionTargetSetData } from '@src/core/entities/exerciseDefinition.interfaces';
import {
    useExerciseDefinition,
    useExerciseDefinitionSuggestions,
} from '@src/data/exerciseDefinitions';
import {
    isGymError,
    useActiveGymSession,
    useAddGymExerciseRecordSet,
    useAddGymExerciseRecordByName,
} from '@src/data/gymSessions';
import {
    createTargetSetFromDefinition,
    DEFAULT_REPS,
    DEFAULT_WEIGHT_KG,
} from '@src/helpers/exerciseDefinition.helpers';
import { getWeightGrams } from '@src/helpers/gymExerciseRecord.helpers';

import { useStyles } from './GymExerciseAddScreen.styles';

const GymExerciseAddScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const st = useStyles();
    const shouldSkipBlurCommitRef = useRef(false);
    const [name, setName] = useState('');
    const [exerciseDefinitionId, setExerciseDefinitionId] = useState<
        string | undefined
    >();
    const [nameError, setNameError] = useState<string | undefined>();
    const { data: activeSession } = useActiveGymSession();
    const addGymExerciseRecord = useAddGymExerciseRecordByName();
    const addGymExerciseRecordSet = useAddGymExerciseRecordSet();
    const { data: selectedExerciseDefinition } =
        useExerciseDefinition(exerciseDefinitionId);
    const suggestions = useExerciseDefinitionSuggestions(name, {
        availability: 'gym',
    });

    const suggestionItems = useMemo<TextFieldSuggestionItem[]>(
        () =>
            suggestions.map((suggestion) => ({
                id: suggestion.id,
                label: suggestion.name,
            })),
        [suggestions],
    );

    const handleNameChange = (value: string) => {
        setName(value);
        setExerciseDefinitionId(undefined);
        setNameError(undefined);
        addGymExerciseRecord.reset();
        addGymExerciseRecordSet.reset();
    };

    const handleSuggestionPress = (suggestion: TextFieldSuggestionItem) => {
        shouldSkipBlurCommitRef.current = true;
        setName(suggestion.label);
        setExerciseDefinitionId(suggestion.id);
        setNameError(undefined);
        addGymExerciseRecord.reset();
        addGymExerciseRecordSet.reset();
    };

    const handleNameBlur = () => {
        if (shouldSkipBlurCommitRef.current) {
            shouldSkipBlurCommitRef.current = false;
            return;
        }

        setName((value) => value.trim());
    };

    const addInitialSet = (recordId: string) => {
        if (!selectedExerciseDefinition) {
            router.replace(`/gymExerciseData/${recordId}`);
            return;
        }

        const fallbackTargetSet: ExerciseDefinitionTargetSetData = {
            reps: DEFAULT_REPS,
            weightGrams: getWeightGrams(DEFAULT_WEIGHT_KG),
        };
        const targetSet = createTargetSetFromDefinition(
            selectedExerciseDefinition,
            fallbackTargetSet,
        );

        addGymExerciseRecordSet.mutate(
            {
                distanceMeters: targetSet.distanceMeters,
                durationSec: targetSet.durationSec,
                exerciseRecordId: recordId,
                reps: targetSet.reps,
                rpeTenths: targetSet.rpeTenths,
                weightGrams: targetSet.weightGrams,
            },
            {
                onSuccess: () => router.replace(`/gymExerciseData/${recordId}`),
            },
        );
    };

    const handleCreate = () => {
        const trimmedName = name.trim();
        if (!activeSession) return;

        if (!trimmedName) {
            setNameError(t('gymActiveSession.addExerciseModal.nameRequired'));
            return;
        }

        addGymExerciseRecord.mutate(
            {
                exerciseDefinitionId,
                name: trimmedName,
                sessionId: activeSession.id,
                startedAtMs: Date.now(),
            },
            {
                onSuccess: (record) => {
                    addInitialSet(record.id);
                },
            },
        );
    };

    const getErrorMessage = (): string => {
        const error =
            addGymExerciseRecord.error ?? addGymExerciseRecordSet.error;

        if (!error) return '';

        if (isGymError(error)) {
            return t(error.message);
        }

        return t('gymActiveSession.errors.addExerciseFailed');
    };

    if (!activeSession) {
        return (
            <MainContainer title={t('gymActiveSession.addExerciseModal.title')}>
                <ListEmptyState
                    title={t('gymActiveSession.emptyTitle')}
                    description={t('gymActiveSession.emptyDescription')}
                    actionLabel={t('gymActiveSession.actions.backToGym')}
                    onPressAction={() => router.replace('/gym')}
                />
            </MainContainer>
        );
    }

    return (
        <MainContainer title={t('gymActiveSession.addExerciseModal.title')}>
            <View style={st.content}>
                <View style={st.formCard}>
                    <View style={st.textContainer}>
                        <AppText variant="title3">
                            {t('gymActiveSession.addExerciseModal.title')}
                        </AppText>

                        <AppText variant="bodySmall" tone="secondary">
                            {t('gymActiveSession.addExerciseModal.subtitle')}
                        </AppText>
                    </View>

                    <TextField
                        label={t('gymActiveSession.addExerciseModal.name')}
                        value={name}
                        onChangeText={handleNameChange}
                        onBlur={handleNameBlur}
                        placeholder={t(
                            'gymActiveSession.addExerciseModal.namePlaceholder',
                        )}
                        autoCapitalize="words"
                        autoFocus
                        returnKeyType="done"
                        suggestions={suggestionItems}
                        onSuggestionPress={handleSuggestionPress}
                        errorText={nameError}
                    />

                    <View style={st.actions}>
                        <View>
                            <ErrorBanner
                                message={getErrorMessage()}
                                onClose={() => {
                                    addGymExerciseRecord.reset();
                                    addGymExerciseRecordSet.reset();
                                }}
                                collapseContentStyle={st.errorBanner}
                            />
                            <Button
                                title={t(
                                    'gymActiveSession.addExerciseModal.create',
                                )}
                                variant="primary"
                                loading={
                                    addGymExerciseRecord.isPending ||
                                    addGymExerciseRecordSet.isPending
                                }
                                onPress={handleCreate}
                            />
                        </View>

                        <Button
                            title={t('common.actions.cancel')}
                            variant="secondary"
                            onPress={() => router.back()}
                        />
                    </View>
                </View>
            </View>
        </MainContainer>
    );
};

export default GymExerciseAddScreen;
