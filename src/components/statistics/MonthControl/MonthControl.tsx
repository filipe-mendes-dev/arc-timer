import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ActionModal } from '@src/components/modals/ActionModal';
import { Button } from '@src/components/ui/Button/Button';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { OptionPills } from '@src/screens/SettingsScreen/components/OptionPills';
import { useTheme } from '@src/theme/ThemeProvider';
import { useMonthControlStyles } from './MonthControl.styles';
import { StatisticsPeriodControl } from '../StatisticsPeriodControl/StatisticsPeriodControl';

interface MonthControlProps {
    month: number;
    onChange: (month: number) => void;
    isPickerVisible: boolean;
    onOpenPicker: () => void;
    onClosePicker: () => void;
}

const MonthPicker = ({ month, onChange, onClosePicker }: MonthControlProps) => {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const st = useMonthControlStyles();
    const [year, setYear] = useState(new Date(month).getFullYear());
    const now = new Date();
    const currentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
    ).getTime();
    const locale = i18n.resolvedLanguage ?? i18n.language;
    let selectedMonth = '';
    if (new Date(month).getFullYear() === year)
        selectedMonth = String(new Date(month).getMonth());
    return (
        <ActionModal
            visible
            style={st.modal}
            title={t('statistics.chooseMonth')}
            onClose={onClosePicker}
            secondaryAction={{
                title: t('common.actions.cancel'),
                onPress: onClosePicker,
            }}
        >
            <View style={st.row}>
                <AppText variant="subtitle" style={st.label}>
                    {year}
                </AppText>
                <View style={st.navigation}>
                    <Button
                        title=""
                        variant="ghost"
                        style={st.arrow}
                        accessibilityRole="button"
                        accessibilityLabel={t('statistics.previousYear')}
                        icon={
                            <AppIcon
                                id="back"
                                size={18}
                                color={theme.palette.text.primary}
                            />
                        }
                        onPress={() => setYear(year - 1)}
                    />
                    <Button
                        title=""
                        variant="ghost"
                        style={st.arrow}
                        accessibilityRole="button"
                        accessibilityLabel={t('statistics.nextYear')}
                        accessibilityState={{
                            disabled: year >= now.getFullYear(),
                        }}
                        disabled={year >= now.getFullYear()}
                        icon={
                            <AppIcon
                                id="back"
                                size={18}
                                color={theme.palette.text.primary}
                                style={st.nextIcon}
                            />
                        }
                        onPress={() => setYear(year + 1)}
                    />
                </View>
            </View>
            <ScrollView style={st.options}>
                <OptionPills
                    options={Array.from({ length: 12 }, (_, index) => {
                        const timestamp = new Date(year, index, 1).getTime();
                        return {
                            value: String(index),
                            label: new Date(timestamp).toLocaleDateString(
                                locale,
                                {
                                    month: 'short',
                                },
                            ),
                            disabled: timestamp > currentMonth,
                        };
                    })}
                    selectedValue={selectedMonth}
                    onSelect={(value) => {
                        onChange(new Date(year, Number(value), 1).getTime());
                        onClosePicker();
                    }}
                />
            </ScrollView>
        </ActionModal>
    );
};

export const MonthControl = (props: MonthControlProps) => {
    const { month, onChange, isPickerVisible, onOpenPicker } = props;
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const st = useMonthControlStyles();
    const date = new Date(month);
    const now = new Date();
    const currentMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
    ).getTime();
    const locale = i18n.resolvedLanguage ?? i18n.language;
    const changeMonth = (offset: number) =>
        onChange(
            new Date(date.getFullYear(), date.getMonth() + offset, 1).getTime(),
        );
    return (
        <>
            <View style={st.row}>
                <StatisticsPeriodControl
                    label={date.toLocaleDateString(locale, {
                        month: 'long',
                        year: 'numeric',
                    })}
                    accessibilityLabel={t('statistics.chooseMonth')}
                    onPress={onOpenPicker}
                />
                <View style={st.navigation}>
                    <Button
                        title=""
                        variant="ghost"
                        style={st.arrow}
                        accessibilityRole="button"
                        accessibilityLabel={t('statistics.previousMonth')}
                        icon={
                            <AppIcon
                                id="back"
                                size={18}
                                color={theme.palette.text.primary}
                            />
                        }
                        onPress={() => changeMonth(-1)}
                    />
                    <Button
                        title=""
                        variant="ghost"
                        style={st.arrow}
                        accessibilityRole="button"
                        accessibilityLabel={t('statistics.nextMonth')}
                        accessibilityState={{ disabled: month >= currentMonth }}
                        disabled={month >= currentMonth}
                        icon={
                            <AppIcon
                                id="back"
                                size={18}
                                color={theme.palette.text.primary}
                                style={st.nextIcon}
                            />
                        }
                        onPress={() => changeMonth(1)}
                    />
                </View>
            </View>
            {isPickerVisible && <MonthPicker {...props} />}
        </>
    );
};
