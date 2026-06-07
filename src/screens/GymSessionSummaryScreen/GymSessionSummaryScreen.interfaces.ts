import type {
    GymExerciseRecord,
    GymExerciseRecordSet,
} from '@src/core/entities/gymSession.interfaces';

export interface GymSessionMetric {
    isDimmed: boolean;
    key: string;
    label: string;
    value: string;
}

export interface ExerciseSummary {
    completedSets: GymExerciseRecordSet[];
    exerciseName: string;
    record: GymExerciseRecord;
}

export interface SectionSummary {
    completedSetCount: number;
    exerciseCount: number;
    id: string;
    label: string;
    records: ExerciseSummary[];
    setCount: number;
}
