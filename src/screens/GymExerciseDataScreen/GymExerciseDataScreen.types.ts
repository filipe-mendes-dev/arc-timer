import type { GymExerciseTrackingFieldsValue } from '@src/core/entities/exerciseTrackingFields';

export interface TrackingFields extends GymExerciseTrackingFieldsValue {}

export interface SetDraft {
    distanceMeters: number;
    durationSec: number;
    id: string;
    reps: number;
    rpeTenths: number;
    weightKg: number;
}
