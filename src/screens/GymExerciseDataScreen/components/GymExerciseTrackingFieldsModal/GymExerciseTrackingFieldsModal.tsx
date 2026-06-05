import { TrackingFieldsModal } from '@src/components/gym/TrackingFieldsModal';

import type { TrackingFields } from '../../GymExerciseDataScreen.types';

interface GymExerciseTrackingFieldsModalProps {
    fieldsWithDataToRemove: readonly (keyof TrackingFields)[];
    isSaving: boolean;
    trackingFields: TrackingFields | null;
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    onToggleField: (field: keyof TrackingFields) => void;
}

const copy = {
    description: 'gymExerciseData.defaults.description',
    removeDataAndSave: 'gymExerciseData.defaults.removeDataAndSave',
    removeDataWarning: 'gymExerciseData.defaults.removeDataWarning',
    title: 'gymExerciseData.defaults.title',
};

export const GymExerciseTrackingFieldsModal = ({
    fieldsWithDataToRemove,
    isSaving,
    trackingFields,
    visible,
    onClose,
    onSave,
    onToggleField,
}: GymExerciseTrackingFieldsModalProps) => {
    return (
        <TrackingFieldsModal
            copy={copy}
            fieldsWithDataToRemove={fieldsWithDataToRemove}
            isSaving={isSaving}
            trackingFields={trackingFields}
            visible={visible}
            onClose={onClose}
            onSave={onSave}
            onToggleField={onToggleField}
        />
    );
};
