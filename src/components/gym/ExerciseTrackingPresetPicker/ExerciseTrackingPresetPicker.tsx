import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActionModal } from '@src/components/modals/ActionModal';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { AppText } from '@src/components/ui/Typography/AppText';
import { AppIcon, type IconId } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';
import { exerciseTrackingFieldDefinitions } from '@src/core/entities/exerciseTrackingFields';
import type {
    ExerciseTrackingField,
    ExerciseTrackingPreset,
    ExerciseTrackingPresetId,
} from '@src/core/entities/exerciseDefinition.interfaces';
import { exerciseTrackingPresets } from '@src/core/exercises/exerciseTrackingPresets';
import { OptionPills } from '@src/screens/SettingsScreen/components/OptionPills';

import { useStyles } from './ExerciseTrackingPresetPicker.styles';

interface ExerciseTrackingPresetPickerProps {
    fields: readonly ExerciseTrackingField[] | undefined;
    onSelect: (preset: ExerciseTrackingPreset) => void;
}

const presetIcons: Record<ExerciseTrackingPresetId, IconId> = {
    strength: 'gym',
    cardio: 'intensity',
    timed: 'time',
    bodyweight: 'exercise',
};

export const ExerciseTrackingPresetPicker = ({
    fields,
    onSelect,
}: ExerciseTrackingPresetPickerProps) => {
    const { t } = useTranslation();
    const st = useStyles();
    const { theme } = useTheme();
    const [isVisible, setVisible] = useState(!fields?.length);
    const preset = exerciseTrackingPresets.find(
        (item) =>
            item.fields.length === fields?.length &&
            item.fields.every((field) => fields.includes(field)),
    );
    const getFieldLabels = (selectedFields: readonly ExerciseTrackingField[]) =>
        exerciseTrackingFieldDefinitions
            .filter((field) => selectedFields.includes(field.field))
            .map((field) => t(field.labelKey))
            .join(' + ');
    const presetId = preset?.id ?? 'custom';
    const summaryIcon = preset ? presetIcons[preset.id] : 'settings';
    const [draftPresetId, setDraftPresetId] = useState<ExerciseTrackingPresetId | 'custom'>(
        presetId,
    );
    const closeModal = () => {
        setDraftPresetId(presetId);
        setVisible(false);
    };
    let summary = t('exerciseDefinitions.trackingSetup.fields');
    if (fields?.length) {
        summary = t(`exerciseDefinitions.trackingSetup.presets.${presetId}`);
    }

    return (
        <>
            <View style={st.container}>
                <AppText variant="caption" tone="secondary">
                    {t('exerciseDefinitions.trackingSetup.title')}
                </AppText>
                <GuardedPressable
                    onPress={() => {
                        setDraftPresetId(presetId);
                        setVisible(true);
                    }}
                    style={st.trigger}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('exerciseDefinitions.trackingSetup.changeDefaults')}: ${summary}`}
                >
                    <View style={st.iconBadge}>
                        <AppIcon id={summaryIcon} size={22} color={theme.palette.accent.primaryStrong} />
                    </View>
                    <View style={st.summary}>
                        <AppText variant="body" weight="semibold">
                            {summary}
                        </AppText>
                        {!!fields?.length && (
                            <AppText variant="caption" tone="secondary">
                                {getFieldLabels(fields)}
                            </AppText>
                        )}
                    </View>
                    <AppIcon id="edit" size={18} color={theme.palette.text.muted} />
                </GuardedPressable>
            </View>
            <ActionModal
                visible={isVisible}
                title={t('exerciseDefinitions.trackingSetup.title')}
                description={t('exerciseDefinitions.trackingSetup.description')}
                onClose={closeModal}
                primaryAction={{
                    title: t('exerciseDefinitions.trackingSetup.confirm'),
                    disabled: draftPresetId === 'custom',
                    onPress: () => {
                        const selected = exerciseTrackingPresets.find(
                            (item) => item.id === draftPresetId,
                        );
                        if (!selected) return;
                        onSelect(selected);
                        setVisible(false);
                    },
                }}
                secondaryAction={{ onPress: closeModal }}
            >
                <OptionPills
                    options={exerciseTrackingPresets.map((item) => ({
                        value: item.id,
                        label: `${t(`exerciseDefinitions.trackingSetup.presets.${item.id}`)}: ${getFieldLabels(item.fields)}`,
                        leftSlot: (
                            <AppIcon
                                id={presetIcons[item.id]}
                                size={18}
                                color={theme.palette.text.primary}
                            />
                        ),
                    }))}
                    selectedValue={draftPresetId}
                    onSelect={setDraftPresetId}
                />
            </ActionModal>
        </>
    );
};
