import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { TextFieldSuggestionItem } from '@src/components/ui/TextField/TextField.interfaces';
import type {
    TopBarDirectAction,
    TopBarOption,
} from '@src/components/navigation/TopBar/TopBar.interfaces';
import type {
    GymPlanExercise,
    GymPlanExerciseTargetSet,
} from '@src/core/entities/gymPlan.interfaces';
import { getGymPlanExerciseTargetSets } from '@src/core/gyms/gymPlanTargetSets';
import { stripPlaceholderGymPlanExercises } from '@src/core/gyms/gymPlanDrafts';
import {
    useFindOrCreateGymExerciseDefinitionByName,
    useGymExerciseDefinitions,
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
import { defaultTrackingFields } from 'src/helpers/exerciseDefinition.helpers';

interface UseGymPlanExerciseEditScreenResult {
    cancelDeleteSets: () => void;
    closeTrackingFieldsModal: () => void;
    editingDraft: SetDraft | null;
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
        const trimmedNameInput = nameInput.trim();
        const suggestionQuery = getSuggestionQuery(
            hasEnteredNameInput,
            trimmedNameInput,
        );
        const { data: suggestedExerciseDefinitions = [] } =
            useGymExerciseDefinitions(suggestionQuery);
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
            setSelectedExerciseDefinitionId(
                getSelectedExerciseDefinitionId(lookup.exercise),
            );
            setHasEnteredNameInput(false);
            setTargetSets(nextTargetSets);
            setTrackingFields(
                inferTrackingFieldsFromTargetSets(nextTargetSets),
            );
        }, [lookup, savedExerciseName]);

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

            setNameInput((current) => {
                const trimmed = current.trim();
                setDisplayExerciseName(trimmed);
                return trimmed;
            });
            setHasEnteredNameInput(false);
        };

        const handleNameChange = (value: string): void => {
            setNameInput(value);
            setSelectedExerciseDefinitionId(undefined);
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

        const saveExercise = (): void => {
            if (!lookup) return;

            if (selectedExerciseDefinitionId) {
                commitExercise(selectedExerciseDefinitionId);
                return;
            }

            if (trimmedNameInput.length === 0) {
                setNameError(t('gymPlanExerciseEdit.errors.nameRequired'));
                return;
            }

            findOrCreateExerciseDefinition.mutate(
                { name: trimmedNameInput },
                {
                    onSuccess: (definition) => {
                        commitExercise(definition.id);
                    },
                },
            );
        };

        const topBarOptions = getTopBarOptions(
            isSelectMode,
            targetSets,
            {
                enterSelectMode,
                openTrackingFieldsModal,
                selectAll,
            },
            t,
        );
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
                findOrCreateExerciseDefinition.isPending,
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
