import React, { useState } from 'react';
import { TextInput, View, type ViewStyle } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import { ActionModal } from '@src/components/modals/ActionModal';
import {
    OptionPills,
    type OptionPillsOption,
} from '@src/screens/SettingsScreen/components/OptionPills';
import { useTheme } from '@src/theme/ThemeProvider';
import { useSearchFieldStyles } from './SearchField.styles';
import GuardedPressable from '../GuardedPressable/GuardedPressable';
import { AppText } from '../Typography/AppText';

interface SearchFieldFilterSection<
    TKey extends string,
    TValue extends string,
> {
    key: TKey;
    title: string;
    options: OptionPillsOption<TValue>[];
}

interface SearchFieldFiltersConfig<
    TKey extends string,
    TValue extends string,
> {
    applyLabel: string;
    clearLabel: string;
    defaultValues?: Partial<Record<TKey, TValue>>;
    sections: SearchFieldFilterSection<TKey, TValue>[];
    title: string;
    values: Partial<Record<TKey, TValue>>;
    onApply: (values: Partial<Record<TKey, TValue>>) => void;
}

interface SearchFieldProps<TKey extends string, TValue extends string> {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    fullWidth?: boolean;
    containerStyle?: ViewStyle;
    filters?: SearchFieldFiltersConfig<TKey, TValue>;
}

export const SearchField = <
    TKey extends string = string,
    TValue extends string = string,
>({
    value,
    onChangeText,
    placeholder = 'Search',
    fullWidth = false,
    containerStyle,
    filters,
}: SearchFieldProps<TKey, TValue>) => {
    const { theme } = useTheme();
    const st = useSearchFieldStyles();
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [draftFilterValues, setDraftFilterValues] = useState<
        Partial<Record<TKey, TValue>>
    >({});

    let activeFilterCount = 0;
    if (filters) {
        activeFilterCount = filters.sections.filter((section) => {
            const currentValue = filters.values[section.key];
            const defaultValue = filters.defaultValues?.[section.key];

            return currentValue !== defaultValue;
        }).length;
    }
    const activeFilterCountLabel =
        activeFilterCount > 9 ? '9+' : `${activeFilterCount}`;

    const handleOpenFilters = (): void => {
        if (!filters) return;

        setDraftFilterValues(filters.values);
        setIsFilterModalVisible(true);
    };

    const handleCloseFilters = (): void => {
        setIsFilterModalVisible(false);
    };

    const handleClearFilters = (): void => {
        setDraftFilterValues(filters?.defaultValues ?? {});
    };

    const handleApplyFilters = (): void => {
        if (!filters) return;

        filters.onApply(draftFilterValues);
        setIsFilterModalVisible(false);
    };

    return (
        <>
            <View
                style={[
                    st.container,
                    fullWidth && st.containerFullWidth,
                    containerStyle,
                ]}
            >
                <Ionicons
                    name="search-outline"
                    size={18}
                    color={theme.palette.text.muted}
                    style={st.iconLeft}
                />

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.palette.text.muted}
                    style={st.input}
                />

                {value.length > 0 && (
                    <GuardedPressable
                        onPress={() => onChangeText('')}
                        style={st.clearHitbox}
                    >
                        <Ionicons
                            name="close-circle"
                            size={22}
                            color={theme.palette.text.muted}
                        />
                    </GuardedPressable>
                )}

                {!!filters && (
                    <GuardedPressable
                        onPress={handleOpenFilters}
                        style={st.filterButton}
                    >
                        <Feather
                            name="sliders"
                            size={18}
                            color={theme.palette.text.inverted}
                        />

                        {activeFilterCount > 0 && (
                            <View style={st.filterBadge}>
                                <AppText
                                    variant="caption"
                                    style={st.filterBadgeText}
                                >
                                    {activeFilterCountLabel}
                                </AppText>
                            </View>
                        )}
                    </GuardedPressable>
                )}
            </View>

            {!!filters && (
                <ActionModal
                    visible={isFilterModalVisible}
                    title={filters.title}
                    primaryAction={{
                        title: filters.applyLabel,
                        onPress: handleApplyFilters,
                    }}
                    secondaryAction={{
                        title: filters.clearLabel,
                        onPress: handleClearFilters,
                    }}
                    onClose={handleCloseFilters}
                >
                    <View style={st.filterSections}>
                        {filters.sections.map((section) => (
                            <View key={section.key} style={st.filterSection}>
                                <AppText variant="bodySmall" tone="secondary">
                                    {section.title}
                                </AppText>

                                <OptionPills
                                    options={section.options}
                                    selectedValue={
                                        draftFilterValues[section.key] ??
                                        section.options[0].value
                                    }
                                    onSelect={(nextValue) =>
                                        setDraftFilterValues((current) => ({
                                            ...current,
                                            [section.key]: nextValue,
                                        }))
                                    }
                                />
                            </View>
                        ))}
                    </View>
                </ActionModal>
            )}
        </>
    );
};
