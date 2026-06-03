import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import { Stepper } from '@src/components/ui/Stepper/Stepper';
import { AppText } from '@src/components/ui/Typography/AppText';

import type {
    SetDraft,
    TrackingFields,
} from '../../GymExerciseDataScreen.types';
import { useStyles } from './GymExerciseSetEditModal.styles';

interface GymExerciseSetEditModalProps {
    draft: SetDraft | null;
    isSaving: boolean;
    trackingFields: TrackingFields;
    onCancel: () => void;
    onChangeDraft: (draft: SetDraft) => void;
    onSave: () => void;
}

export const GymExerciseSetEditModal = ({
    draft,
    isSaving,
    trackingFields,
    onCancel,
    onChangeDraft,
    onSave,
}: GymExerciseSetEditModalProps) => {
    const { t } = useTranslation();
    const st = useStyles();

    return (
        <Modal
            visible={!!draft}
            onRequestClose={onCancel}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.modalBody}>
                <View style={st.modalText}>
                    <AppText variant="title3">
                        {t('gymExerciseData.editSet.title')}
                    </AppText>

                    <AppText variant="bodySmall" tone="secondary">
                        {t('gymExerciseData.editSet.description')}
                    </AppText>
                </View>

                {draft && (
                    <View style={st.defaultsControls}>
                        {trackingFields.hasReps && (
                            <Stepper
                                label={t('gymExerciseData.fields.reps')}
                                value={draft.reps}
                                onChange={(value) =>
                                    onChangeDraft({
                                        ...draft,
                                        reps: value,
                                    })
                                }
                                min={0}
                                step={1}
                            />
                        )}

                        {trackingFields.hasWeight && (
                            <Stepper
                                label={t('gymExerciseData.fields.weightKg')}
                                value={draft.weightKg}
                                onChange={(value) =>
                                    onChangeDraft({
                                        ...draft,
                                        weightKg: value,
                                    })
                                }
                                min={0}
                                step={5}
                                formatValue={(value) =>
                                    t('gymExerciseData.setDetails.weight', {
                                        value,
                                    })
                                }
                            />
                        )}

                        {trackingFields.hasDurationSec && (
                            <Stepper
                                label={t('gymExerciseData.fields.durationSec')}
                                value={draft.durationSec}
                                onChange={(value) =>
                                    onChangeDraft({
                                        ...draft,
                                        durationSec: value,
                                    })
                                }
                                min={0}
                                step={5}
                            />
                        )}

                        {trackingFields.hasDistanceMeters && (
                            <Stepper
                                label={t(
                                    'gymExerciseData.fields.distanceMeters',
                                )}
                                value={draft.distanceMeters}
                                onChange={(value) =>
                                    onChangeDraft({
                                        ...draft,
                                        distanceMeters: value,
                                    })
                                }
                                min={0}
                                step={100}
                            />
                        )}
                    </View>
                )}

                <View style={st.modalActions}>
                    <Button
                        title={t('common.actions.cancel')}
                        variant="secondary"
                        onPress={onCancel}
                        flex
                    />

                    <Button
                        title={t('common.actions.done')}
                        variant="primary"
                        loading={isSaving}
                        onPress={onSave}
                        flex
                    />
                </View>
            </View>
        </Modal>
    );
};
