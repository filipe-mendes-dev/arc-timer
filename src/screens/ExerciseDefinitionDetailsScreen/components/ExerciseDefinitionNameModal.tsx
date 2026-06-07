import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExerciseDefinition } from '@src/core/entities/exerciseDefinition.interfaces';
import {
    isExerciseDefinitionError,
    useSaveExerciseDefinition,
} from '@src/data/exerciseDefinitions';
import { ActionModal } from '@src/components/modals/ActionModal';
import { TextField } from '@src/components/ui/TextField/TextField';

interface ExerciseDefinitionNameModalProps {
    definition: ExerciseDefinition | null;
    visible: boolean;
    onClose: () => void;
}

export const ExerciseDefinitionNameModal = ({
    definition,
    visible,
    onClose,
}: ExerciseDefinitionNameModalProps) => {
    const { t } = useTranslation();
    const saveExerciseDefinition = useSaveExerciseDefinition();
    const lastDefinitionRef = useRef<ExerciseDefinition | null>(null);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<string | undefined>();

    if (definition) {
        lastDefinitionRef.current = definition;
    }

    const visibleDefinition = definition ?? lastDefinitionRef.current;

    useEffect(() => {
        if (!visible) return;

        setName(visibleDefinition?.name ?? '');
        setNameError(undefined);
    }, [visible, visibleDefinition]);

    const handleSave = async (): Promise<void> => {
        if (!visibleDefinition) return;

        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError(t('exerciseDefinitions.validation.nameRequired'));
            return;
        }

        try {
            if (trimmedName !== visibleDefinition.name) {
                await saveExerciseDefinition.mutateAsync({
                    changes: { name: trimmedName },
                    id: visibleDefinition.id,
                    intent: 'update',
                });
            }

            onClose();
        } catch (error: unknown) {
            if (
                isExerciseDefinitionError(error) &&
                error.code === 'DUPLICATE_NAME'
            ) {
                setNameError(t(error.message));
                return;
            }

            setNameError(t('exerciseDefinitions.validation.saveFailed'));
        }
    };

    return (
        <ActionModal
            visible={visible}
            title={t('exerciseDefinitions.nameModal.title')}
            description={t('exerciseDefinitions.nameModal.description')}
            error={{
                message: nameError ?? '',
                onClose: () => setNameError(undefined),
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
            <TextField
                label={t('exerciseDefinitions.fields.name')}
                value={name}
                onChangeText={(value) => {
                    setName(value);
                    setNameError(undefined);
                }}
                autoCapitalize="words"
                returnKeyType="done"
            />
        </ActionModal>
    );
};
