export interface TrackingFields {
    hasDistanceMeters: boolean;
    hasDurationSec: boolean;
    hasReps: boolean;
    hasWeight: boolean;
}

export interface SetDraft {
    distanceMeters: number;
    durationSec: number;
    id: string;
    reps: number;
    weightKg: number;
}
