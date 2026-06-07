import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ExerciseDefinition } from '@src/core/entities/exerciseDefinition.interfaces';
import {
    isExerciseDefinitionError,
    useSaveExerciseDefinition,
} from '@src/data/exerciseDefinitions';
import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import { TextField } from '@src/components/ui/TextField/TextField';
import { AppText } from '@src/components/ui/Typography/AppText';

import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

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
    const st = useExerciseDefinitionDetailsScreenStyles();
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
        <Modal
            visible={visible}
            onRequestClose={onClose}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.modalBody}>
                <View style={st.modalText}>
                    <AppText variant="title3">
                        {t('exerciseDefinitions.nameModal.title')}
                    </AppText>
                    <AppText variant="bodySmall" tone="secondary">
                        {t('exerciseDefinitions.nameModal.description')}
                    </AppText>
                </View>

                <TextField
                    label={t('exerciseDefinitions.fields.name')}
                    value={name}
                    onChangeText={(value) => {
                        setName(value);
                        setNameError(undefined);
                    }}
                    autoCapitalize="words"
                    returnKeyType="done"
                    errorText={nameError}
                />

                <View style={st.modalActions}>
                    <Button
                        title={t('common.actions.save')}
                        variant="primary"
                        loading={saveExerciseDefinition.isPending}
                        onPress={handleSave}
                    />
                    <Button
                        title={t('common.actions.cancel')}
                        variant="ghost"
                        onPress={onClose}
                    />
                </View>
            </View>
        </Modal>
    );
};
