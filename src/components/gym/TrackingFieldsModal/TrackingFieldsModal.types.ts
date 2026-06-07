import type { ExerciseTrackingField } from '@src/core/entities/exerciseDefinition.interfaces';
import type { TrackingFieldsValue } from '@src/core/entities/exerciseTrackingFields';

export type { TrackingFieldsValue } from '@src/core/entities/exerciseTrackingFields';

export interface TrackingFieldsModalCopy {
    description: string;
    removeDataAndSave: string;
    removeDataWarning: string;
    title: string;
}

export interface TrackingFieldsModalField<
    FieldValues extends TrackingFieldsValue,
> {
    field: ExerciseTrackingField;
    key: Extract<keyof FieldValues, string>;
    labelKey: string;
}
