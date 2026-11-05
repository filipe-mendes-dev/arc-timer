import { ActivityIndicator, FlatList, View } from 'react-native';
import { useMemo, useState, type ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@src/theme/ThemeProvider';
import { useExerciseUsage } from '@src/data/statistics/statisticsQueries';
import { useStatisticsPeriod } from '@src/screens/StatisticsScreen/useStatisticsPeriod';
import type { StatisticsPeriod } from '@src/core/statistics/gymStatistics';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { Button } from '@src/components/ui/Button/Button';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { ActionModal } from '@src/components/modals/ActionModal';
import { ExerciseDefinitionCard } from './components/ExerciseDefinitionCard/ExerciseDefinitionCard';
import { ExerciseDefinitionFormModal } from './components/ExerciseDefinitionFormModal/ExerciseDefinitionFormModal';
import { useExerciseDefinitionsScreenStyles } from './ExerciseDefinitionsScreen.styles';
import { useExerciseDefinitionsList } from './hooks/useExerciseDefinitionsList';
import { useExerciseDefinitionsSelection } from './hooks/useExerciseDefinitionsSelection';

interface ExerciseDefinitionsEmptyStateProps {
    hasSearch: boolean;
    onNewExercise: () => void;
    t: TFunction;
}

const ExerciseDefinitionsEmptyState = ({
    hasSearch,
    onNewExercise,
    t,
}: ExerciseDefinitionsEmptyStateProps) => {
    if (hasSearch) {
        return (
            <ListEmptyState
                title={t('exerciseDefinitions.searchEmptyTitle')}
                description={t('exerciseDefinitions.searchEmptyDescription')}
            />
        );
    }

    return (
        <ListEmptyState
            title={t('exerciseDefinitions.emptyTitle')}
            description={t('exerciseDefinitions.emptyDescription')}
            actionLabel={t('exerciseDefinitions.createButton')}
            onPressAction={onNewExercise}
        />
    );
};

interface ExerciseDefinitionsScreenProps {
    isProgressMode?: boolean;
}

const progressPeriods: readonly StatisticsPeriod[] = ['all', 'month', 'threeMonths', 'year'];

const ExerciseDefinitionsScreen = ({
    isProgressMode = false,
}: ExerciseDefinitionsScreenProps) => {
    const { t, i18n } = useTranslation();
    const st = useExerciseDefinitionsScreenStyles();
    const router = useRouter();
    const { theme } = useTheme();
    const list = useExerciseDefinitionsList(isProgressMode);
    const selection = useExerciseDefinitionsSelection();
    const period = useStatisticsPeriod();
    const [exerciseFilter, setExerciseFilter] = useState('history');
    const shouldIncludeUntrained = exerciseFilter === 'all';
    const {
        data: stats,
        isPending: isStatsPending,
        isError: hasStatsError,
        refetch: refetchStats,
    } = useExerciseUsage(period.range, undefined, isProgressMode);
    const allTimeRange = useMemo(
        () => ({ endedBeforeMs: period.now + 1 }),
        [period.now],
    );
    const {
        data: allTimeStats,
        isPending: isHistoryPending,
        isError: hasHistoryError,
        refetch: refetchHistory,
    } = useExerciseUsage(allTimeRange, undefined, isProgressMode);
    const statsById = new Map(
        stats?.map((exercise) => [exercise.id, exercise]),
    );
    const historyById = new Map(
        allTimeStats?.map((exercise) => [exercise.id, exercise]),
    );
    const exercises = list.exerciseDefinitions.filter(
        (exercise) =>
            !isProgressMode ||
            shouldIncludeUntrained ||
            historyById.has(exercise.id),
    );
    const locale = i18n.resolvedLanguage ?? i18n.language;

    const progressFilters: ComponentProps<typeof SearchField>['filters'] = {
        title: t('history.filters.title'),
        applyLabel: t('history.filters.apply'),
        clearLabel: t('history.filters.clear'),
        defaultValues: { activity: 'all', period: 'all' },
        values: { activity: exerciseFilter, period: period.selection.period },
        sections: [
            {
                key: 'activity',
                title: t('statistics.showExercises'),
                options: [
                    {
                        value: 'history',
                        label: t('statistics.trainedExercises'),
                    },
                    { value: 'all', label: t('statistics.allExercises') },
                ],
            },
            {
                key: 'period',
                title: t('statistics.choosePeriod'),
                options: progressPeriods.map((value) => ({
                    value,
                    label: t(`statistics.period.${value}`),
                })),
            },
        ],
        onApply: (values) => {
            setExerciseFilter(values.activity ?? 'all');
            const selectedPeriod = progressPeriods.find((value) => value === values.period) ?? 'all';
            period.setSelection({ period: selectedPeriod });
        },
    };

    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <MainContainer
            title={isProgressMode ? t('statistics.exerciseProgress') : selection.screenTitle}
            scroll={false}
            noPadding
            topBarOptions={isProgressMode ? undefined : selection.topBarOptions}
            topBarLeftMode={isProgressMode ? 'back' : undefined}
            topBarLeftAction={isProgressMode ? undefined : selection.topBarLeftAction}
            topBarRightAction={isProgressMode ? undefined : selection.topBarRightAction}
        >
            <FlatList
                data={exercises}
                keyExtractor={(item) => item.id}
                style={st.list}
                contentContainerStyle={st.listContent}
                ListHeaderComponent={
                    <View style={st.headerContainer}>
                        <View style={st.headerRow}>
                            <SearchField
                                value={list.search}
                                onChangeText={list.setSearch}
                                fullWidth
                                filters={isProgressMode ? progressFilters : undefined}
                                placeholder={t(
                                    'exerciseDefinitions.searchPlaceholder',
                                )}
                            />

                            {!isProgressMode && !selection.isSelectMode && (
                                <Button
                                    title={t('exerciseDefinitions.newButton')}
                                    variant="primary"
                                    onPress={openModal}
                                    style={st.newButton}
                                />
                            )}
                        </View>
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => {
                    const isSelectionLocked =
                        selection.isSelectMode && !item.canDelete;
                    const onLockedPress = () =>
                        selection.requestLockedInfo(item.deleteBlockReason);
                    let onRemove: (() => void) | undefined;
                    if (item.canDelete) {
                        onRemove = () => selection.requestRemoval(item.id);
                    }

                    const currentStats = statsById.get(item.id);
                    const lastTrained = historyById.get(
                        item.id,
                    )?.lastUsedAtMs;
                    let metadata: string | undefined;
                    if (isProgressMode) {
                        const count = currentStats?.sessionCount ?? 0;
                        metadata = t('statistics.sessionCountInPeriod', {
                            count,
                            period: period.label,
                        });
                        if (count === 0)
                            metadata = t('statistics.noSessionsInPeriod', {
                                period: period.label,
                            });
                        if (lastTrained !== undefined)
                            metadata += ` · ${t('statistics.lastTrained', { date: new Date(lastTrained).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }) })}`;
                    }
                    const openExercise = () => {
                        if (isProgressMode)
                            router.push({
                                pathname: '/statistics/exercise/[id]',
                                params: { id: item.id, ...period.routeParams },
                            });
                        else list.goToExerciseDefinition(item.id);
                    };
                    return (
                        <ExerciseDefinitionCard
                            item={item}
                            metadata={metadata}
                            onPress={openExercise}
                            onRemove={isProgressMode ? undefined : onRemove}
                            isSelectMode={
                                !isProgressMode && selection.isSelectMode
                            }
                            isSelectionLocked={isSelectionLocked}
                            isSelected={selection.isSelected(item.id)}
                            onSelect={() => selection.toggleItem(item.id)}
                            onLockedPress={onLockedPress}
                        />
                    );
                }}
                ListEmptyComponent={
                    <>
                        {!isProgressMode && (
                            <ExerciseDefinitionsEmptyState
                                hasSearch={list.hasSearch}
                                onNewExercise={openModal}
                                t={t}
                            />
                        )}
                        {isProgressMode &&
                            (isStatsPending || isHistoryPending) && (
                                <ActivityIndicator
                                    color={theme.palette.accent.primary}
                                />
                            )}
                        {isProgressMode &&
                            (hasStatsError || hasHistoryError) && (
                                <Button
                                    title={t('statistics.retry')}
                                    variant="secondary"
                                    onPress={async () => {
                                        await Promise.all([
                                            refetchStats(),
                                            refetchHistory(),
                                        ]);
                                    }}
                                />
                            )}
                        {isProgressMode &&
                            !isStatsPending &&
                            !isHistoryPending &&
                            !hasStatsError &&
                            !hasHistoryError && (
                                <ListEmptyState
                                    title={t('statistics.emptyTitle')}
                                    description={t(
                                        'statistics.emptyDescription',
                                    )}
                                />
                            )}
                    </>
                }
                keyboardShouldPersistTaps="handled"
            />

            <ExerciseDefinitionFormModal
                visible={isModalVisible}
                onClose={closeModal}
            />

            <ConfirmDialog
                visible={selection.hasPendingRemoval}
                title={selection.confirmTitle}
                message={selection.confirmMessage}
                confirmLabel={t('exerciseDefinitions.confirmRemove.confirm')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={selection.confirmRemoval}
                onCancel={selection.cancelRemoval}
            />

            <ActionModal
                visible={selection.isLockedInfoVisible}
                title={selection.lockedInfoTitle}
                description={selection.lockedInfoMessage}
                primaryAction={{
                    title: t('common.actions.done'),
                    onPress: selection.closeLockedInfo,
                }}
                onClose={selection.closeLockedInfo}
            />
        </MainContainer>
    );
};

export default ExerciseDefinitionsScreen;
