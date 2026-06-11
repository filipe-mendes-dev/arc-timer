import React from 'react';
import { View } from 'react-native';

import { Modal } from '@src/components/modals/Modal';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useNewWorkoutModalStyles } from './NewWorkoutModal.styles';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { useTranslation } from 'react-i18next';

interface NewWorkoutModalProps {
    visible: boolean;
    closeModal: () => void;
    handleImportFromFile: () => Promise<void>;
    onCreateNew: () => void;
}

const NewWorkoutModal = ({
    visible,
    closeModal,
    handleImportFromFile,
    onCreateNew,
}: NewWorkoutModalProps) => {
    const { t } = useTranslation();
    const st = useNewWorkoutModalStyles();

    const handleImport = async () => {
        await handleImportFromFile();
    };

    return (
        <Modal
            visible={visible}
            onRequestClose={closeModal}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.mainContainer}>
                <View style={st.textContainer}>
                    <AppText variant="title3" tone="primary">
                        {t('workouts.modal.title')}
                    </AppText>

                    <AppText variant="bodySmall" tone="muted">
                        {t('workouts.modal.subtitle')}
                    </AppText>
                </View>

                <View style={st.buttonsContainer}>
                    <Button
                        title={t('workouts.modal.createNew')}
                        variant="primary"
                        onPress={onCreateNew}
                    />

                    <Button
                        title={t('workouts.modal.importFromFile')}
                        variant="secondary"
                        onPress={handleImport}
                    />

                    <GuardedPressable
                        onPress={closeModal}
                        style={st.cancelButton}
                    >
                        <AppText variant="bodySmall" tone="muted">
                            {t('workouts.modal.cancel')}
                        </AppText>
                    </GuardedPressable>
                </View>
            </View>
        </Modal>
    );
};

export default NewWorkoutModal;
