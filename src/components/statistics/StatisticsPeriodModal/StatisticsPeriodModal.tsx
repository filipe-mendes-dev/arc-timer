import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useStatisticsPeriodModalStyles } from './StatisticsPeriodModal.styles';
import { useTranslation } from 'react-i18next';
import { ActionModal } from '@src/components/modals/ActionModal';
import { OptionPills } from '@src/screens/SettingsScreen/components/OptionPills';
import type {
    StatisticsPeriod,
    StatisticsPeriodSelection,
} from '@src/core/statistics/gymStatistics';

interface StatisticsPeriodModalProps {
    visible: boolean;
    selection: StatisticsPeriodSelection;
    onChange: (selection: StatisticsPeriodSelection) => void;
    onClose: () => void;
}
interface PeriodPickerProps extends Omit<
    StatisticsPeriodModalProps,
    'visible'
> {}
const periods: readonly StatisticsPeriod[] = [
    'month',
    'threeMonths',
    'year',
    'all',
];

const PeriodPicker = ({ selection, onChange, onClose }: PeriodPickerProps) => {
    const { t } = useTranslation();
    const [period, setPeriod] = useState(selection.period);
    const st = useStatisticsPeriodModalStyles();
    return (
        <ActionModal
            visible
            style={st.modal}
            title={t('statistics.choosePeriod')}
            onClose={onClose}
            primaryAction={{
                title: t('history.filters.apply'),
                onPress: () => {
                    onChange({ period });
                    onClose();
                },
            }}
            secondaryAction={{
                title: t('common.actions.cancel'),
                onPress: onClose,
            }}
        >
            <ScrollView style={st.options}>
                <OptionPills
                    options={periods.map((value) => ({
                        value,
                        label: t(`statistics.period.${value}`),
                    }))}
                    selectedValue={period}
                    onSelect={setPeriod}
                />
            </ScrollView>
        </ActionModal>
    );
};

export const StatisticsPeriodModal = ({
    visible,
    ...props
}: StatisticsPeriodModalProps) => {
    if (!visible) return null;
    return <PeriodPicker {...props} />;
};
