import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
} from '@src/core/entities/exerciseDefinition.interfaces';
import {
    isExerciseDefinitionError,
    useSaveExerciseDefinition,
} from '@src/data/exerciseDefinitions';
import { ActionModal } from '@src/components/modals/ActionModal';
import { OptionPills } from '@src/screens/SettingsScreen/components/OptionPills';

import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

interface ExerciseDefinitionAvailabilityModalProps {
    definition: ExerciseDefinition | null;
    visible: boolean;
    onClose: () => void;
}

export const ExerciseDefinitionAvailabilityModal = ({
    definition,
    visible,
    onClose,
}: ExerciseDefinitionAvailabilityModalProps) => {
    const { t } = useTranslation();
    const st = useExerciseDefinitionDetailsScreenStyles();
    const saveExerciseDefinition = useSaveExerciseDefinition();
    const lastDefinitionRef = useRef<ExerciseDefinition | null>(null);
    const [availability, setAvailability] =
        useState<ExerciseDefinitionAvailability>('both');
    const [error, setError] = useState<string | undefined>();

    if (definition) {
        lastDefinitionRef.current = definition;
    }

    const visibleDefinition = definition ?? lastDefinitionRef.current;
    const availabilityOptions = useMemo(
        () => [
            {
                value: 'both' as const,
                label: t('exerciseDefinitions.availability.both'),
            },
            {
                value: 'workout' as const,
                label: t('exerciseDefinitions.availability.workout'),
            },
            {
                value: 'gym' as const,
                label: t('exerciseDefinitions.availability.gym'),
            },
        ],
        [t],
    );

    useEffect(() => {
        if (!visible) return;

        setAvailability(visibleDefinition?.availability ?? 'both');
        setError(undefined);
    }, [visible, visibleDefinition]);

    const handleSave = async (): Promise<void> => {
        if (!visibleDefinition) return;

        try {
            if (availability !== visibleDefinition.availability) {
                await saveExerciseDefinition.mutateAsync({
                    changes: { availability },
                    id: visibleDefinition.id,
                    intent: 'update',
                });
            }

            onClose();
        } catch (caughtError: unknown) {
            if (
                isExerciseDefinitionError(caughtError) &&
                (caughtError.code === 'GYM_ONLY_RESTRICTED' ||
                    caughtError.code === 'WORKOUT_ONLY_RESTRICTED')
            ) {
                setError(t(caughtError.message));
                return;
            }

            setError(t('exerciseDefinitions.validation.saveFailed'));
        }
    };

    return (
        <ActionModal
            visible={visible}
            title={t('exerciseDefinitions.availabilityModal.title')}
            description={t('exerciseDefinitions.availabilityModal.description')}
            error={{
                message: error ?? '',
                onClose: () => setError(undefined),
            }}
            primaryAction={{
                loading: saveExerciseDefinition.isPending,
                onPress: handleSave,
            }}
            secondaryAction={{
                onPress: onClose,
            }}
            onClose={onClose}
        >
            <View style={st.availabilityModalOptions}>
                <OptionPills
                    options={availabilityOptions}
                    selectedValue={availability}
                    onSelect={(value) => {
                        setAvailability(value);
                        setError(undefined);
                    }}
                />
            </View>
        </ActionModal>
    );
};
