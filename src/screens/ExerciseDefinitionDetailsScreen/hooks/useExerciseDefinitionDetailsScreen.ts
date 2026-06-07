import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
    isExerciseDefinitionError,
    useDeleteExerciseDefinition,
    useExerciseDefinition,
} from '@src/data/exerciseDefinitions';

import {
    formatMetric,
    formatWeight,
    type ExerciseDefinitionStatItem,
} from '../ExerciseDefinitionDetailsScreen.helpers';

interface UseExerciseDefinitionDetailsScreenResult {
    deleteError: string | undefined;
    definition: ReturnType<typeof useExerciseDefinition>['data'];
    exerciseStatItems: ExerciseDefinitionStatItem[];
    isAvailabilityModalVisible: boolean;
    isDeleteDialogVisible: boolean;
    isNameModalVisible: boolean;
    isNotFound: boolean;
    screenTitle: string;
    closeAvailabilityModal: () => void;
    closeDeleteDialog: () => void;
    closeNameModal: () => void;
    confirmDelete: () => Promise<void>;
    goBack: () => void;
    goToGymSession: (sessionId: string) => void;
    openAvailabilityModal: () => void;
    openDeleteDialog: () => void;
    openNameModal: () => void;
}

export const useExerciseDefinitionDetailsScreen =
    (): UseExerciseDefinitionDetailsScreenResult => {
        const { t } = useTranslation();
        const { id } = useLocalSearchParams<{ id?: string }>();
        const router = useRouter();
        const { data: definition } = useExerciseDefinition(id);
        const deleteExerciseDefinition = useDeleteExerciseDefinition();
        const [isNameModalVisible, setIsNameModalVisible] = useState(false);
        const [isAvailabilityModalVisible, setIsAvailabilityModalVisible] =
            useState(false);
        const [isDeleteDialogVisible, setIsDeleteDialogVisible] =
            useState(false);
        const [deleteError, setDeleteError] = useState<string | undefined>();

        const exerciseStatItems = useMemo<ExerciseDefinitionStatItem[]>(() => {
            if (!definition?.stats) return [];

            const items: ExerciseDefinitionStatItem[] = [];

            if (definition.stats.weightPr) {
                items.push({
                    id: 'weight-pr',
                    labelKey: 'exerciseDefinitions.fields.weightPr',
                    value:
                        formatWeight(definition.stats.weightPr.value) ??
                        t('exerciseDefinitions.emptyValue'),
                });
            }

            if (definition.stats.distancePr) {
                items.push({
                    id: 'distance-pr',
                    labelKey: 'exerciseDefinitions.fields.distancePr',
                    value:
                        formatMetric(definition.stats.distancePr.value) ??
                        t('exerciseDefinitions.emptyValue'),
                });
            }

            return items;
        }, [definition, t]);

        const closeDeleteDialog = (): void => {
            setDeleteError(undefined);
            setIsDeleteDialogVisible(false);
        };

        const confirmDelete = async (): Promise<void> => {
            if (!definition) return;

            try {
                setDeleteError(undefined);
                await deleteExerciseDefinition.mutateAsync(definition.id);
                setIsDeleteDialogVisible(false);
                router.back();
            } catch (e) {
                if (isExerciseDefinitionError(e)) {
                    setDeleteError(t(e.message));
                    return;
                }

                setDeleteError(
                    t('exerciseDefinitions.validation.deleteFailed'),
                );
            }
        };

        return {
            deleteError,
            definition,
            exerciseStatItems,
            isAvailabilityModalVisible,
            isDeleteDialogVisible,
            isNameModalVisible,
            isNotFound: !id || !definition,
            screenTitle:
                definition?.name ?? t('exerciseDefinitions.detailsTitle'),
            closeAvailabilityModal: () => setIsAvailabilityModalVisible(false),
            closeDeleteDialog,
            closeNameModal: () => setIsNameModalVisible(false),
            confirmDelete,
            goBack: () => router.back(),
            goToGymSession: (sessionId: string) =>
                router.push(`/gymHistory/${sessionId}`),
            openAvailabilityModal: () => setIsAvailabilityModalVisible(true),
            openDeleteDialog: () => setIsDeleteDialogVisible(true),
            openNameModal: () => setIsNameModalVisible(true),
        };
    };
