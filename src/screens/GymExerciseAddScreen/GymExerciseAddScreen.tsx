import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExerciseTrackingPresetPicker } from '@src/components/gym/ExerciseTrackingPresetPicker/ExerciseTrackingPresetPicker';
import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { TextField } from '@src/components/ui/TextField/TextField';
import type { TextFieldSuggestionItem } from '@src/components/ui/TextField/TextField.interfaces';
import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import { AppText } from '@src/components/ui/Typography/AppText';
import type { ExerciseTrackingPreset } from '@src/core/entities/exerciseDefinition.interfaces';
import {
    useExerciseDefinition,
    useExerciseDefinitionByNormalizedName,
    useExerciseDefinitionSuggestions,
} from '@src/data/exerciseDefinitions';
import {
    isGymError,
    useActiveGymSession,
    useAddConfiguredGymExerciseRecord,
} from '@src/data/gymSessions';

import { useStyles } from './GymExerciseAddScreen.styles';

const GymExerciseAddScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const st = useStyles();
    const shouldSkipBlurRef = useRef(false);
    const [name, setName] = useState('');
    const [committedName, setCommittedName] = useState('');
    const [exerciseDefinitionId, setExerciseDefinitionId] = useState<string>();
    const [nameError, setNameError] = useState<string>();
    const [selectedPreset, setSelectedPreset] = useState<ExerciseTrackingPreset | null>(null);
    const { data: activeSession } = useActiveGymSession();
    const addExercise = useAddConfiguredGymExerciseRecord();
    const suggestions = useExerciseDefinitionSuggestions(name, {
        availability: 'gym',
    });
    const { data: exactDefinition } = useExerciseDefinitionByNormalizedName(committedName);
    const resolvedId = exerciseDefinitionId ?? exactDefinition?.id;
    const { data: definition } = useExerciseDefinition(resolvedId);
    const fields = selectedPreset?.fields ?? definition?.data?.defaultTrackingFields;
    const defaults = selectedPreset?.defaultTargetSet ?? definition?.data?.defaultTargetSet;

    const handleNameChange = (value: string) => {
        shouldSkipBlurRef.current = false;
        setName(value);
        setCommittedName('');
        setExerciseDefinitionId(undefined);
        setSelectedPreset(null);
        setNameError(undefined);
        addExercise.reset();
    };
    const handleNameBlur = () => {
        if (shouldSkipBlurRef.current) {
            shouldSkipBlurRef.current = false;
            return;
        }
        setName(name.trim());
        setCommittedName(name.trim());
    };
    const handleSuggestionPress = (suggestion: TextFieldSuggestionItem) => {
        shouldSkipBlurRef.current = true;
        setName(suggestion.label);
        setCommittedName(suggestion.label);
        setExerciseDefinitionId(suggestion.id);
        setSelectedPreset(null);
        setNameError(undefined);
        addExercise.reset();
    };
    const handleCreate = () => {
        if (!activeSession || !fields?.length) return;
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError(t('gymActiveSession.addExerciseModal.nameRequired'));
            return;
        }
        addExercise.mutate(
            {
                defaultTargetSet: defaults,
                defaultTrackingFields: fields,
                exerciseDefinitionId: resolvedId,
                name: trimmedName,
                sessionId: activeSession.id,
                startedAtMs: Date.now(),
            },
            {
                onSuccess: (record) => router.replace(`/gymExerciseData/${record.id}`),
            },
        );
    };
    let errorMessage = '';
    if (addExercise.error) {
        errorMessage = t('gymActiveSession.errors.addExerciseFailed');
        if (isGymError(addExercise.error)) errorMessage = t(addExercise.error.message);
    }
    const topBarOptions: TopBarOption[] = [];
    if (committedName && definition?.data?.defaultTrackingFields.length) {
        topBarOptions.push({
            id: 'change-defaults',
            label: t('exerciseDefinitions.trackingSetup.changeDefaults'),
            icon: 'edit',
            onPress: () =>
                router.push({
                    pathname: '/exercise-definitions/[id]',
                    params: { id: definition.id },
                }),
        });
    }

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
        <MainContainer
            title={t('gymActiveSession.addExerciseModal.title')}
            topBarOptions={topBarOptions}
        >
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
                        onSubmitEditing={handleNameBlur}
                        placeholder={t('gymActiveSession.addExerciseModal.namePlaceholder')}
                        autoCapitalize="words"
                        autoCorrect={false}
                        spellCheck={false}
                        autoFocus
                        returnKeyType="done"
                        errorText={nameError}
                        suggestions={suggestions.map((item) => ({
                            id: item.id,
                            label: item.name,
                        }))}
                        onSuggestionPress={handleSuggestionPress}
                    />
                    {!!committedName &&
                        (!definition?.data?.defaultTrackingFields.length ||
                            selectedPreset !== null) && (
                            <ExerciseTrackingPresetPicker
                                key={resolvedId ?? committedName}
                                fields={fields}
                                onSelect={setSelectedPreset}
                            />
                        )}
                    <View style={st.actions}>
                        <View>
                            <ErrorBanner
                                message={errorMessage}
                                onClose={() => addExercise.reset()}
                                collapseContentStyle={st.errorBanner}
                            />
                            <Button
                                title={t('gymActiveSession.addExerciseModal.create')}
                                variant="primary"
                                loading={addExercise.isPending}
                                disabled={!committedName || !fields?.length}
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
