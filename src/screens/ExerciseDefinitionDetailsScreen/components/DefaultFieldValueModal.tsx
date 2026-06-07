import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type {
    ExerciseDefinitionTargetSetData,
    ExerciseTrackingField,
} from '@src/core/entities/exerciseDefinition.interfaces';
import { Button } from '@src/components/ui/Button/Button';
import { Stepper } from '@src/components/ui/Stepper/Stepper';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Modal } from '@src/components/modals/Modal';

import {
    trackingFieldLabelKeyByField,
    type ExerciseDefinitionTargetValue,
} from '../ExerciseDefinitionDetailsScreen.helpers';
import { useExerciseDefinitionDetailsScreenStyles } from '../ExerciseDefinitionDetailsScreen.styles';

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
    const st = useExerciseDefinitionDetailsScreenStyles();
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
        <Modal
            visible={visible}
            onRequestClose={onClose}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.modalBody}>
                <View style={st.modalText}>
                    <AppText variant="title3">
                        {t('exerciseDefinitions.defaultValueModal.title', {
                            field: fieldLabel,
                        })}
                    </AppText>
                    <AppText variant="bodySmall" tone="secondary">
                        {t('exerciseDefinitions.defaultValueModal.description')}
                    </AppText>
                </View>

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

                <View style={st.modalActions}>
                    <Button
                        title={t('common.actions.save')}
                        variant="primary"
                        loading={isSaving}
                        onPress={handleSave}
                    />
                    <Button
                        title={t('common.actions.cancel')}
                        variant="ghost"
                        onPress={onClose}
                    />
                </View>
            </View>
        </Modal>
    );
};
