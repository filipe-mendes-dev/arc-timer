import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
    ExerciseDefinitionTargetSetData,
    ExerciseTrackingField,
} from '@src/core/entities/exerciseDefinition.interfaces';
import { trackingFieldLabelKeyByField } from '@src/core/entities/exerciseTrackingFields';
import { ActionModal } from '@src/components/modals/ActionModal';
import { Stepper } from '@src/components/ui/Stepper/Stepper';

import type { ExerciseDefinitionTargetValue } from '../ExerciseDefinitionDetailsScreen.helpers';

interface DefaultFieldValueModalProps {
    field: ExerciseTrackingField | null;
    isSaving: boolean;
    targetSet?: ExerciseDefinitionTargetSetData;
    visible: boolean;
    onClose: () => void;
    onSave: (
        field: ExerciseTrackingField,
        value: ExerciseDefinitionTargetValue,
    ) => void | Promise<void>;
}

const getInitialValue = (
    field: ExerciseTrackingField | null,
    targetSet: ExerciseDefinitionTargetSetData | undefined,
): number => {
    if (field === 'reps') return targetSet?.reps ?? 12;
    if (field === 'weight') return (targetSet?.weightGrams ?? 10000) / 1000;
    if (field === 'duration') return targetSet?.durationSec ?? 60;
    if (field === 'distance') {
        return (targetSet?.distanceMeters ?? 1000) / 1000;
    }
    if (field === 'rpe') return (targetSet?.rpeTenths ?? 70) / 10;

    return 12;
};

const getTargetValue = (
    field: ExerciseTrackingField,
    value: number,
): ExerciseDefinitionTargetValue => {
    if (field === 'weight') {
        return {
            field,
            weightGrams: Math.round(value * 1000),
        };
    }

    if (field === 'rpe') {
        return {
            field,
            rpeTenths: Math.round(value * 10),
        };
    }

    if (field === 'duration') {
        return {
            field,
            durationSec: Math.round(value),
        };
    }

    if (field === 'distance') {
        return {
            field,
            distanceMeters: Math.round(value * 1000),
        };
    }

    return {
        field,
        reps: Math.round(value),
    };
};

export const DefaultFieldValueModal = ({
    field,
    isSaving,
    targetSet,
    visible,
    onClose,
    onSave,
}: DefaultFieldValueModalProps) => {
    const { t } = useTranslation();
    const lastFieldRef = useRef<ExerciseTrackingField | null>(null);
    const lastTargetSetRef = useRef<
        ExerciseDefinitionTargetSetData | undefined
    >(undefined);
    if (visible && field) {
        lastFieldRef.current = field;
    }
    if (visible) {
        lastTargetSetRef.current = targetSet;
    }

    const visibleField = field ?? lastFieldRef.current;
    const visibleTargetSet = targetSet ?? lastTargetSetRef.current;
    const fieldLabel = visibleField
        ? t(trackingFieldLabelKeyByField[visibleField])
        : '';
    const [value, setValue] = useState(() =>
        getInitialValue(visibleField, visibleTargetSet),
    );

    useEffect(() => {
        if (!visible) return;

        setValue(getInitialValue(visibleField, visibleTargetSet));
    }, [visible, visibleField, visibleTargetSet]);

    const handleSave = (): void => {
        if (!visibleField) return;

        Promise.resolve(
            onSave(visibleField, getTargetValue(visibleField, value)),
        ).catch((error: unknown) => {
            console.error('save default field value failed', error);
        });
    };

    return (
        <ActionModal
            visible={visible}
            title={t('exerciseDefinitions.defaultValueModal.title', {
                field: fieldLabel,
            })}
            description={t('exerciseDefinitions.defaultValueModal.description')}
            primaryAction={{
                loading: isSaving,
                onPress: handleSave,
            }}
            secondaryAction={{
                onPress: onClose,
            }}
            onClose={onClose}
        >
            {visibleField === 'reps' && (
                <Stepper
                    label={fieldLabel}
                    value={value}
                    onChange={setValue}
                    min={0}
                    step={1}
                />
            )}

            {visibleField === 'weight' && (
                <Stepper
                    label={fieldLabel}
                    value={value}
                    onChange={setValue}
                    allowDecimal
                    decimalPlaces={1}
                    min={0}
                    step={2.5}
                    formatValue={(nextValue) =>
                        t('gymExerciseData.setDetails.weight', {
                            value: nextValue,
                        })
                    }
                />
            )}

            {visibleField === 'duration' && (
                <Stepper
                    label={fieldLabel}
                    value={value}
                    onChange={setValue}
                    min={0}
                    step={30}
                    formatValue={(nextValue) =>
                        t('gymExerciseData.setDetails.duration', {
                            value: `${nextValue} sec`,
                        })
                    }
                />
            )}

            {visibleField === 'distance' && (
                <Stepper
                    label={fieldLabel}
                    value={value}
                    onChange={setValue}
                    allowDecimal
                    decimalPlaces={2}
                    min={0}
                    step={0.5}
                    formatValue={(nextValue) =>
                        t('gymExerciseData.setDetails.distance', {
                            value: nextValue,
                        })
                    }
                />
            )}

            {visibleField === 'rpe' && (
                <Stepper
                    label={fieldLabel}
                    value={value}
                    onChange={setValue}
                    allowDecimal
                    decimalPlaces={1}
                    min={0}
                    max={10}
                    step={0.5}
                />
            )}
        </ActionModal>
    );
};
