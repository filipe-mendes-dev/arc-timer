import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';

import { useNewGymPlanModalStyles } from './NewGymPlanModal.styles';

interface NewGymPlanModalProps {
    isImporting: boolean;
    isStartingDraft: boolean;
    visible: boolean;
    onClose: () => void;
    onCreateNew: () => void;
    onImportFromFile: () => Promise<void>;
}

export const NewGymPlanModal = ({
    isImporting,
    isStartingDraft,
    onClose,
    onCreateNew,
    onImportFromFile,
    visible,
}: NewGymPlanModalProps) => {
    const { t } = useTranslation();
    const st = useNewGymPlanModalStyles();

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.mainContainer}>
                <View style={st.textContainer}>
                    <AppText variant="title3" tone="primary">
                        {t('gymPlans.modal.title')}
                    </AppText>

                    <AppText variant="bodySmall" tone="muted">
                        {t('gymPlans.modal.subtitle')}
                    </AppText>
                </View>

                <View style={st.buttonsContainer}>
                    <Button
                        title={t('gymPlans.modal.createNew')}
                        variant="primary"
                        onPress={onCreateNew}
                        loading={isStartingDraft}
                    />

                    <Button
                        title={t('gymPlans.modal.importFromFile')}
                        variant="secondary"
                        onPress={onImportFromFile}
                        loading={isImporting}
                    />

                    <GuardedPressable
                        onPress={onClose}
                        style={st.cancelButton}
                    >
                        <AppText variant="bodySmall" tone="muted">
                            {t('gymPlans.modal.cancel')}
                        </AppText>
                    </GuardedPressable>
                </View>
            </View>
        </Modal>
    );
};
