export interface TrackingFieldsValue {
    hasDistanceMeters: boolean;
    hasDurationSec: boolean;
    hasReps: boolean;
    hasRpe?: boolean;
    hasWeight: boolean;
}

export type TrackingFieldKey = keyof TrackingFieldsValue;

export interface TrackingFieldsModalCopy {
    description: string;
    removeDataAndSave: string;
    removeDataWarning: string;
    title: string;
}
