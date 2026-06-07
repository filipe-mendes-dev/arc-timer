import type { ExerciseTrackingField } from './exerciseDefinition.interfaces';

export interface GymExerciseTrackingFieldsValue {
    hasDistanceMeters: boolean;
    hasDurationSec: boolean;
    hasReps: boolean;
    hasRpe: boolean;
    hasWeight: boolean;
}

export interface ExerciseDefinitionTrackingFieldsValue
    extends GymExerciseTrackingFieldsValue {
    hasRpe: boolean;
}

export interface TrackingFieldsValue extends GymExerciseTrackingFieldsValue {}

export type TrackingFieldKey = keyof TrackingFieldsValue;

export interface ExerciseTrackingFieldDefinition<
    Key extends TrackingFieldKey = TrackingFieldKey,
> {
    field: ExerciseTrackingField;
    key: Key;
    labelKey: string;
}

export const exerciseTrackingFieldDefinitions: ExerciseTrackingFieldDefinition[] =
    [
        {
            field: 'reps',
            key: 'hasReps',
            labelKey: 'exerciseDefinitions.trackingField.reps',
        },
        {
            field: 'weight',
            key: 'hasWeight',
            labelKey: 'exerciseDefinitions.trackingField.weight',
        },
        {
            field: 'duration',
            key: 'hasDurationSec',
            labelKey: 'exerciseDefinitions.trackingField.duration',
        },
        {
            field: 'distance',
            key: 'hasDistanceMeters',
            labelKey: 'exerciseDefinitions.trackingField.distance',
        },
        {
            field: 'rpe',
            key: 'hasRpe',
            labelKey: 'exerciseDefinitions.trackingField.rpe',
        },
    ];

export const exerciseTrackingFields = exerciseTrackingFieldDefinitions.map(
    (definition) => definition.field,
);

export const trackingFieldKeyByField: Record<
    ExerciseTrackingField,
    TrackingFieldKey
> = {
    reps: 'hasReps',
    weight: 'hasWeight',
    duration: 'hasDurationSec',
    distance: 'hasDistanceMeters',
    rpe: 'hasRpe',
};

export const trackingFieldLabelKeyByField: Record<
    ExerciseTrackingField,
    string
> = {
    reps: 'exerciseDefinitions.trackingField.reps',
    weight: 'exerciseDefinitions.trackingField.weight',
    duration: 'exerciseDefinitions.trackingField.duration',
    distance: 'exerciseDefinitions.trackingField.distance',
    rpe: 'exerciseDefinitions.trackingField.rpe',
};

export const trackingFieldValueFromFields = (
    fields: readonly ExerciseTrackingField[],
): ExerciseDefinitionTrackingFieldsValue => ({
    hasDistanceMeters: fields.includes('distance'),
    hasDurationSec: fields.includes('duration'),
    hasReps: fields.includes('reps'),
    hasRpe: fields.includes('rpe'),
    hasWeight: fields.includes('weight'),
});

export const fieldsFromTrackingFieldValue = (
    trackingValue: TrackingFieldsValue,
): ExerciseTrackingField[] =>
    exerciseTrackingFieldDefinitions
        .filter((definition) => trackingValue[definition.key] === true)
        .map((definition) => definition.field);
