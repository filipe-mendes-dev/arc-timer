import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { TextFieldSuggestionItem } from '@src/components/ui/TextField/TextField.interfaces';
import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import type { ExerciseTrackingPreset } from '@src/core/entities/exerciseDefinition.interfaces';
import { trackingFieldValueFromFields } from '@src/core/entities/exerciseTrackingFields';
import type {
    GymPlanExercise,
    GymPlanExerciseTargetSet,
} from '@src/core/entities/gymPlan.interfaces';
import {
    createGymPlanTargetSet,
    getGymPlanExerciseTargetSets,
} from '@src/core/gyms/gymPlanTargetSets';
import { stripPlaceholderGymPlanExercises } from '@src/core/gyms/gymPlanDrafts';
import {
    useExerciseDefinition,
    useExerciseDefinitionByNormalizedName,
    useSaveExerciseDefinitionData,
    useFindOrCreateGymExerciseDefinitionByName,
    useGymExerciseDefinitions,
    useExerciseDefinitionSuggestions,
} from '@src/data/exerciseDefinitions';
import { useUpsertDraftGymPlan } from '@src/data/gymPlans';
import { useListSelection } from '@src/hooks/useListSelection';
import { useGymPlanBuilderStore } from '@src/state/stores/useGymPlanBuilderStore';
import { useTheme } from '@src/theme/ThemeProvider';

import type {
    SetDraft,
    TrackingFields,
} from '../GymExerciseDataScreen/GymExerciseDataScreen.types';
import {
    buildCommittedDraft,
    createNextTargetSet,
    draftFromTargetSet,
    getExerciseDefinitionName,
    getExerciseLookup,
    getExerciseTitle,
    getRemovedTrackingFields,
    getSelectedExerciseDefinitionId,
    getSuggestionQuery,
    getTargetSetDetails,
    getTopBarConfig,
    getTopBarOptions,
    inferTrackingFieldsFromTargetSets,
    MAX_SUGGESTION_COUNT,
    removeTrackingFieldData,
    setHasTrackingFieldData,
    targetSetFromDraft,
} from './GymPlanExerciseEditScreen.helpers';
import {
    createTargetSetFromDefinition,
    defaultTrackingFields,
    trackingFieldsFromDefinition,
} from 'src/helpers/exerciseDefinition.helpers';

interface UseGymPlanExerciseEditScreenResult {
    cancelDeleteSets: () => void;
    closeTrackingFieldsModal: () => void;
    editingDraft: SetDraft | null;
    committedName: string;
    shouldShowPresetPicker: boolean;
    errorMessage: string;
    canSave: boolean;
    presetFields: ExerciseTrackingPreset['fields'] | undefined;
    selectPreset: (preset: ExerciseTrackingPreset) => void;
    exerciseSuggestions: TextFieldSuggestionItem[];
    fieldsWithData: (keyof TrackingFields)[];
    goBack: () => void;
    handleNameBlur: () => void;
    handleNameChange: (value: string) => void;
    handleNameSuggestionPress: (suggestion: TextFieldSuggestionItem) => void;
    isNotFound: boolean;
    isSaving: boolean;
    isSelectMode: boolean;
    isTrackingFieldsModalVisible: boolean;
    nameError: string | undefined;
    nameInput: string;
    pendingDeleteSets: GymPlanExerciseTargetSet[];
    saveExercise: () => void;
    saveSetDraft: () => void;
    saveTrackingFields: (value: TrackingFields) => void;
    setEditingDraft: (draft: SetDraft | null) => void;
    targetSets: GymPlanExerciseTargetSet[];
    topBarLeftAction: TopBarDirectAction | undefined;
    topBarOptions: readonly TopBarOption[];
    topBarRightAction: TopBarDirectAction | undefined;
    trackingFields: TrackingFields;
    updateEditingDraft: (draft: SetDraft | null) => void;
    addSet: () => void;
    getSetDetails: (set: GymPlanExerciseTargetSet) => string;
    openSet: (set: GymPlanExerciseTargetSet) => void;
    requestDeleteSet: (set: GymPlanExerciseTargetSet) => void;
    screenTitle: string;
    toggleSetSelection: (setId: string) => void;
    isSetSelected: (setId: string) => boolean;
    confirmDeleteSets: () => void;
}

export const useGymPlanExerciseEditScreen =
    (): UseGymPlanExerciseEditScreenResult => {
        const { t } = useTranslation();
        const router = useRouter();
        const { theme } = useTheme();
        const { exerciseId, sectionId } = useLocalSearchParams<{
            exerciseId?: string;
            sectionId?: string;
        }>();
        const upsertDraft = useUpsertDraftGymPlan();
        const findOrCreateExerciseDefinition =
            useFindOrCreateGymExerciseDefinitionByName();
        const saveDefinitionData = useSaveExerciseDefinitionData();
        const [committedName, setCommittedName] = useState('');
        const [selectedPreset, setSelectedPreset] =
            useState<ExerciseTrackingPreset | null>(null);
        const draft = useGymPlanBuilderStore((state) => state.draft);
        const checkpointDraft = useGymPlanBuilderStore(
            (state) => state.checkpointDraft,
        );
        const setDraft = useGymPlanBuilderStore((state) => state.setDraft);
        const { data: exerciseDefinitions = [] } = useGymExerciseDefinitions();
        const [nameInput, setNameInput] = useState('');
        const [nameError, setNameError] = useState<string | undefined>();
        const [displayExerciseName, setDisplayExerciseName] = useState('');
        const [selectedExerciseDefinitionId, setSelectedExerciseDefinitionId] =
            useState<string | undefined>();
        const [hasEnteredNameInput, setHasEnteredNameInput] = useState(false);
        const [trackingFields, setTrackingFields] = useState<TrackingFields>(
            defaultTrackingFields,
        );
        const [isTrackingFieldsModalVisible, setTrackingFieldsModalVisible] =
            useState(false);
        const [editingDraft, setEditingDraft] = useState<SetDraft | null>(null);
        const [pendingDeleteSets, setPendingDeleteSets] = useState<
            GymPlanExerciseTargetSet[]
        >([]);
        const [targetSets, setTargetSets] = useState<
            GymPlanExerciseTargetSet[]
        >([]);
        const hydratedExerciseIdRef = useRef<string | null>(null);
        const createExerciseDraftRef = useRef<GymPlanExercise | null>(null);
        const shouldSkipNameBlurCommitRef = useRef(false);
        const seededDefaultsKeyRef = useRef<string | null>(null);
        const trimmedNameInput = nameInput.trim();
        const suggestionQuery = getSuggestionQuery(
            hasEnteredNameInput,
            trimmedNameInput,
        );
        const { data: exactDefinition } =
            useExerciseDefinitionByNormalizedName(committedName);
        const resolvedId = selectedExerciseDefinitionId ?? exactDefinition?.id;
        const { data: selectedExerciseDefinition } = useExerciseDefinition(resolvedId);
        const presetFields =
            selectedPreset?.fields ??
            selectedExerciseDefinition?.data?.defaultTrackingFields;
        const suggestedExerciseDefinitions = useExerciseDefinitionSuggestions(
            suggestionQuery ?? '',
            { availability: 'gym' },
        );
        const {
            enterSelectMode,
            exitSelectMode,
            hasSelection,
            isSelectMode,
            isSelected,
            selectAll,
            selectedCount,
            selectedIds,
            toggleItem,
        } = useListSelection();

        const lookup = useMemo(
            () =>
                getExerciseLookup(
                    draft,
                    sectionId,
                    exerciseId,
                    createExerciseDraftRef,
                ),
            [draft, exerciseId, sectionId],
        );
        const isConfiguringNewExercise =
            !!lookup &&
            (lookup.isCreating || !lookup.exercise.exerciseDefinitionId);

        const exerciseDefinitionName = getExerciseDefinitionName(
            lookup?.exercise.exerciseDefinitionId,
            exerciseDefinitions,
        );
        const savedExerciseName =
            exerciseDefinitionName ?? lookup?.exercise.name ?? '';
        const screenBaseTitle = getExerciseTitle(displayExerciseName, t);
        const exerciseSuggestions = useMemo<TextFieldSuggestionItem[]>(() => {
            if (!hasEnteredNameInput || trimmedNameInput.length === 0) {
                return [];
            }

            return suggestedExerciseDefinitions
                .slice(0, MAX_SUGGESTION_COUNT)
                .map((definition) => ({
                    id: definition.id,
                    label: definition.name,
                }));
        }, [
            hasEnteredNameInput,
            suggestedExerciseDefinitions,
            trimmedNameInput,
        ]);
        const fieldsWithData = useMemo(
            () =>
                (
                    [
                        'hasReps',
                        'hasWeight',
                        'hasDurationSec',
                        'hasDistanceMeters',
                        'hasRpe',
                    ] as (keyof TrackingFields)[]
                ).filter((field) =>
                    targetSets.some((set) =>
                        setHasTrackingFieldData(set, field),
                    ),
                ),
            [targetSets],
        );

        useEffect(() => {
            if (!lookup) return;
            if (hydratedExerciseIdRef.current === lookup.exercise.id) return;

            hydratedExerciseIdRef.current = lookup.exercise.id;
            const nextTargetSets = getGymPlanExerciseTargetSets(
                lookup.exercise,
            );
            setNameInput(savedExerciseName);
            setDisplayExerciseName(savedExerciseName);
            setCommittedName(savedExerciseName);
            setSelectedExerciseDefinitionId(
                getSelectedExerciseDefinitionId(lookup.exercise),
            );
            setHasEnteredNameInput(false);
            setTargetSets(nextTargetSets);
            setTrackingFields(
                inferTrackingFieldsFromTargetSets(nextTargetSets),
            );
        }, [lookup, savedExerciseName]);

        useEffect(() => {
            if (!selectedExerciseDefinition || !lookup || selectedPreset) return;
            const defaultsKey = `${selectedExerciseDefinition.id}:${selectedExerciseDefinition.data?.updatedAtMs ?? 0}`;
            if (seededDefaultsKeyRef.current === defaultsKey) {
                return;
            }
            seededDefaultsKeyRef.current = defaultsKey;

            if (isConfiguringNewExercise) {
                setTargetSets((current) =>
                    current.map((set) => ({
                        ...createTargetSetFromDefinition(
                            selectedExerciseDefinition,
                            createGymPlanTargetSet(set.setIndex),
                        ),
                        id: set.id,
                        createdAtMs: set.createdAtMs,
                    })),
                );
                setTrackingFields(
                    trackingFieldsFromDefinition(selectedExerciseDefinition),
                );
            } else {
                const hasTargetValues = getGymPlanExerciseTargetSets(
                    lookup.exercise,
                ).some(
                    (set) =>
                        set.reps !== undefined ||
                        set.weightGrams !== undefined ||
                        set.durationSec !== undefined ||
                        set.distanceMeters !== undefined ||
                        set.rpeTenths !== undefined,
                );
                if (!hasTargetValues) {
                    setTrackingFields(
                        trackingFieldsFromDefinition(selectedExerciseDefinition),
                    );
                }
            }
        }, [
            selectedExerciseDefinition,
            lookup,
            selectedPreset,
            isConfiguringNewExercise,
        ]);

        const goBack = (): void => {
            router.back();
        };

        const commitExercise = (exerciseDefinitionId: string): void => {
            const nextDraft = buildCommittedDraft(
                draft,
                lookup,
                exerciseDefinitionId,
                targetSets,
            );
            if (!nextDraft) return;

            setDraft(nextDraft);
            upsertDraft.mutate(stripPlaceholderGymPlanExercises(nextDraft), {
                onSuccess: () => {
                    checkpointDraft();
                    router.back();
                },
            });
        };

        const handleNameBlur = (): void => {
            if (shouldSkipNameBlurCommitRef.current) {
                shouldSkipNameBlurCommitRef.current = false;
                return;
            }

            const trimmed = nameInput.trim();
            setNameInput(trimmed);
            setDisplayExerciseName(trimmed);
            setCommittedName(trimmed);
            setHasEnteredNameInput(false);
        };

        const handleNameChange = (value: string): void => {
            setNameInput(value);
            setSelectedExerciseDefinitionId(undefined);
            seededDefaultsKeyRef.current = null;
            setCommittedName('');
            setSelectedPreset(null);
            saveDefinitionData.reset();
            if (isConfiguringNewExercise) {
                setTargetSets([createGymPlanTargetSet(0)]);
                setTrackingFields(trackingFieldValueFromFields([]));
            }
            setHasEnteredNameInput(value.trim().length > 0);
            setNameError(undefined);
            findOrCreateExerciseDefinition.reset();
        };

        const handleNameSuggestionPress = (
            suggestion: TextFieldSuggestionItem,
        ): void => {
            shouldSkipNameBlurCommitRef.current = true;
            setNameInput(suggestion.label);
            setDisplayExerciseName(suggestion.label);
            setSelectedExerciseDefinitionId(suggestion.id);
            seededDefaultsKeyRef.current = null;
            setCommittedName(suggestion.label);
            setSelectedPreset(null);
            saveDefinitionData.reset();
            setHasEnteredNameInput(false);
            setNameError(undefined);
            findOrCreateExerciseDefinition.reset();
        };

        const addSet = (): void => {
            setTargetSets([
                ...targetSets,
                createNextTargetSet(targetSets, trackingFields),
            ]);
        };

        const getSetDetails = (set: GymPlanExerciseTargetSet): string =>
            getTargetSetDetails(set, t);

        const openSet = (set: GymPlanExerciseTargetSet): void => {
            if (isSelectMode) {
                toggleItem(set.id);
                return;
            }

            setEditingDraft(draftFromTargetSet(set));
        };

        const saveSetDraft = (): void => {
            if (!editingDraft) return;

            const nextSet = targetSetFromDraft(editingDraft, trackingFields);

            setTargetSets(
                targetSets.map((set) => {
                    if (set.id !== nextSet.id) return set;

                    return {
                        ...set,
                        ...nextSet,
                        setIndex: set.setIndex,
                        createdAtMs: set.createdAtMs,
                    };
                }),
            );
            setEditingDraft(null);
        };

        const requestDeleteSet = (set: GymPlanExerciseTargetSet): void => {
            setPendingDeleteSets([set]);
        };

        const requestSelectedDelete = (): void => {
            setPendingDeleteSets(
                targetSets.filter((set) => selectedIds.has(set.id)),
            );
        };

        const cancelDeleteSets = (): void => {
            setPendingDeleteSets([]);
        };

        const confirmDeleteSets = (): void => {
            setTargetSets(
                targetSets.filter((set) => !pendingDeleteSets.includes(set)),
            );
            setPendingDeleteSets([]);
            if (isSelectMode) {
                exitSelectMode();
            }
        };

        const openTrackingFieldsModal = (): void => {
            setTrackingFieldsModalVisible(true);
        };

        const closeTrackingFieldsModal = (): void => {
            setTrackingFieldsModalVisible(false);
        };

        const saveTrackingFields = (value: TrackingFields): void => {
            const removedFields = getRemovedTrackingFields(
                trackingFields,
                value,
            );

            setTargetSets(removeTrackingFieldData(targetSets, removedFields));
            setTrackingFields(value);
            setTrackingFieldsModalVisible(false);
        };

        const selectPreset = (preset: ExerciseTrackingPreset): void => {
            setSelectedPreset(preset);
            if (!isConfiguringNewExercise) return;
            setTrackingFields(trackingFieldValueFromFields(preset.fields));
            setTargetSets((current) =>
                current.map((set) => ({
                    ...createGymPlanTargetSet(set.setIndex),
                    id: set.id,
                    createdAtMs: set.createdAtMs,
                    ...preset.defaultTargetSet,
                })),
            );
        };

        const saveExercise = async (): Promise<void> => {
            if (!lookup || !presetFields?.length) return;
            if (trimmedNameInput.length === 0) {
                setNameError(t('gymPlanExerciseEdit.errors.nameRequired'));
                return;
            }

            try {
                let definition = selectedExerciseDefinition;
                definition ??=
                    await findOrCreateExerciseDefinition.mutateAsync({
                        name: trimmedNameInput,
                    });
                if (selectedPreset) {
                    await saveDefinitionData.mutateAsync({
                        defaultTargetSet: selectedPreset.defaultTargetSet,
                        defaultTrackingFields: selectedPreset.fields,
                        exerciseDefinitionId: definition.id,
                        notes: definition.data?.notes,
                    });
                }
                commitExercise(definition.id);
            } catch {
                // Mutation errors remain available to the screen.
            }
        };

        let errorMessage = '';
        if (
            saveDefinitionData.error ||
            findOrCreateExerciseDefinition.error ||
            upsertDraft.error
        ) {
            errorMessage = t('gymPlanExerciseEdit.errors.saveFailed');
        }

        const topBarOptions = [...getTopBarOptions(
            isSelectMode,
            targetSets,
            {
                enterSelectMode,
                openTrackingFieldsModal,
                selectAll,
            },
            t,
        )];
        if (!isSelectMode && committedName && selectedExerciseDefinition?.data?.defaultTrackingFields.length) {
            topBarOptions.push({
                id: 'change-defaults',
                label: t('exerciseDefinitions.trackingSetup.changeDefaults'),
                icon: 'edit',
                onPress: () => router.push({
                    pathname: '/exercise-definitions/[id]',
                    params: { id: selectedExerciseDefinition.id },
                }),
            });
        }
        const topBarConfig = getTopBarConfig(
            screenBaseTitle,
            isSelectMode,
            selectedCount,
            hasSelection,
            {
                error: theme.palette.icon.error,
                secondary: theme.palette.text.secondary,
            },
            {
                exitSelectMode,
                requestSelectedDelete,
            },
            t,
        );

        return {
            addSet,
            cancelDeleteSets,
            closeTrackingFieldsModal,
            confirmDeleteSets,
            editingDraft,
            committedName,
            shouldShowPresetPicker: !!committedName && (!selectedExerciseDefinition?.data?.defaultTrackingFields.length || selectedPreset !== null),
            errorMessage,
            canSave: !!committedName && !!presetFields?.length,
            presetFields,
            selectPreset,
            exerciseSuggestions,
            fieldsWithData,
            getSetDetails,
            goBack,
            handleNameBlur,
            handleNameChange,
            handleNameSuggestionPress,
            isNotFound: !lookup,
            isSaving:
                upsertDraft.isPending ||
                findOrCreateExerciseDefinition.isPending ||
                saveDefinitionData.isPending,
            isSelectMode,
            isSetSelected: isSelected,
            isTrackingFieldsModalVisible,
            nameError,
            nameInput,
            openSet,
            pendingDeleteSets,
            requestDeleteSet,
            saveExercise,
            saveSetDraft,
            saveTrackingFields,
            screenTitle: topBarConfig.title,
            setEditingDraft,
            targetSets,
            toggleSetSelection: toggleItem,
            topBarLeftAction: topBarConfig.leftAction,
            topBarOptions,
            topBarRightAction: topBarConfig.rightAction,
            trackingFields,
            updateEditingDraft: setEditingDraft,
        };
    };
