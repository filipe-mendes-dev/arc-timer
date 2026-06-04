import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Modal } from '@src/components/modals/Modal';
import { Button } from '@src/components/ui/Button/Button';
import { Stepper } from '@src/components/ui/Stepper/Stepper';
import { AppText } from '@src/components/ui/Typography/AppText';

import type {
    SetDraft,
    TrackingFields,
} from '../../GymExerciseDataScreen.types';
import { formatDurationMinutes } from '../../GymExerciseDataScreen.helpers';
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
    const lastDraftRef = useRef<SetDraft | null>(null);

    if (draft) {
        lastDraftRef.current = draft;
    }

    const visibleDraft = draft ?? lastDraftRef.current;

    return (
        <Modal
            visible={!!draft}
            onRequestClose={onCancel}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <ScrollView
                contentContainerStyle={st.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={st.modalText}>
                    <AppText variant="title3">
                        {t('gymExerciseData.editSet.title')}
                    </AppText>

                    <AppText variant="bodySmall" tone="secondary">
                        {t('gymExerciseData.editSet.description')}
                    </AppText>
                </View>

                {visibleDraft && (
                    <View style={st.defaultsControls}>
                        {trackingFields.hasReps && (
                            <Stepper
                                label={t('gymExerciseData.fields.reps')}
                                value={visibleDraft.reps}
                                onChange={(value) =>
                                    onChangeDraft({
                                        ...visibleDraft,
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
                                value={visibleDraft.weightKg}
                                onChange={(value) =>
                                    onChangeDraft({
                                        ...visibleDraft,
                                        weightKg: value,
                                    })
                                }
                                allowDecimal
                                decimalPlaces={1}
                                min={0}
                                step={2.5}
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
                                value={Math.round(
                                    visibleDraft.durationSec / 60,
                                )}
                                onChange={(value) =>
                                    onChangeDraft({
                                        ...visibleDraft,
                                        durationSec: Math.round(value * 60),
                                    })
                                }
                                min={0}
                                step={5}
                                formatValue={(value) =>
                                    t(
                                        'gymExerciseData.setDetails.duration',
                                        {
                                            value: formatDurationMinutes(
                                                value * 60,
                                            ),
                                        },
                                    )
                                }
                            />
                        )}

                        {trackingFields.hasDistanceMeters && (
                            <Stepper
                                label={t(
                                    'gymExerciseData.fields.distanceMeters',
                                )}
                                value={visibleDraft.distanceMeters / 1000}
                                onChange={(value) =>
                                    onChangeDraft({
                                        ...visibleDraft,
                                        distanceMeters: Math.round(
                                            value * 1000,
                                        ),
                                    })
                                }
                                allowDecimal
                                decimalPlaces={2}
                                min={0}
                                step={0.5}
                                formatValue={(value) =>
                                    t('gymExerciseData.setDetails.distance', {
                                        value,
                                    })
                                }
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
            </ScrollView>
        </Modal>
    );
};
