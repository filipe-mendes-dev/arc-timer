import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import type { TrainingSessionKind } from '@src/core/entities/trainingSession.interfaces';
import { useTrainingSessionHistory } from '@src/data/trainingSessions';
import { useStyles } from './HistoryScreen.styles';
import { TrainingSessionListItem } from './components/TrainingSessionListItem';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { useTranslation } from 'react-i18next';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { useHistorySelection } from './useHistorySelection';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { useExerciseDefinition } from '@src/data/exerciseDefinitions';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useTheme } from '@src/theme/ThemeProvider';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';

type HistoryFilterKind = TrainingSessionKind | 'all';
type HistoryFilterKey = 'kind';

interface HistoryFilterOption {
    value: HistoryFilterKind;
    label: string;
}

const parseHistoryFilterKind = (
    value: string | string[] | undefined,
): HistoryFilterKind => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    if (normalizedValue === 'hiit' || normalizedValue === 'gym') {
        return normalizedValue;
    }

    return 'all';
};

const getSessionKey = (kind: TrainingSessionKind, sessionId: string): string =>
    `${kind}:${sessionId}`;

const getSessionRoute = (
    kind: TrainingSessionKind,
    sessionId: string,
): `/history/${string}` | `/gymHistory/${string}` => {
    if (kind === 'hiit') return `/history/${sessionId}`;

    return `/gymHistory/${sessionId}`;
};

const HistoryScreen = () => {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const router = useRouter();
    const { kind, exerciseDefinitionId, startedAtMs, endedBeforeMs } =
        useLocalSearchParams<{
            kind?: string;
            exerciseDefinitionId?: string;
            startedAtMs?: string;
            endedBeforeMs?: string;
        }>();
    const { data: definition } = useExerciseDefinition(exerciseDefinitionId);
    const locale = i18n.resolvedLanguage ?? i18n.language;
    const st = useStyles();

    const [search, setSearch] = useState('');
    const [selectedKind, setSelectedKind] = useState<HistoryFilterKind>(() =>
        parseHistoryFilterKind(kind),
    );

    useEffect(() => {
        setSelectedKind(parseHistoryFilterKind(kind));
    }, [kind]);
    let queryKind: TrainingSessionKind | undefined;
    if (selectedKind !== 'all') {
        queryKind = selectedKind;
    }

    const debouncedSearch = useDebouncedValue(search.trim(), 150);
    const start = startedAtMs ? Number(startedAtMs) : undefined;
    const end = endedBeforeMs ? Number(endedBeforeMs) : undefined;
    const {
        data: history,
        isPending,
        isError,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useTrainingSessionHistory({
        kind: queryKind,
        exerciseDefinitionId,
        search: debouncedSearch,
        startedAtMs: Number.isFinite(start) ? start : undefined,
        endedBeforeMs: Number.isFinite(end) ? end : undefined,
    });
    const data = useMemo(() => history?.pages.flat() ?? [], [history]);
    const hasSearch = search.trim().length > 0;
    const hasAnySessions = data.length > 0;

    const {
        screenTitle,
        topBarOptions,
        topBarLeftAction,
        topBarRightAction,
        isSelectMode,
        isSelected,
        toggleItem,
        hasPendingRemoval,
        confirmTitle,
        confirmMessage,
        confirmRemoval,
        cancelRemoval,
        errorMessage,
        handleCloseError,
    } = useHistorySelection();

    const filterOptions: HistoryFilterOption[] = [
        { value: 'all', label: t('history.filters.all') },
        { value: 'hiit', label: t('history.filters.hiit') },
        { value: 'gym', label: t('history.filters.gym') },
    ];

    let emptyTitle = t('history.emptyTitle');
    let emptyDescription = t('history.emptyDescription');
    if (hasSearch) {
        emptyTitle = t('history.searchEmptyTitle');
        emptyDescription = t('history.searchEmptyDescription');
    } else if (!hasAnySessions && selectedKind !== 'all') {
        emptyTitle = t('history.filterEmptyTitle');
        emptyDescription = t('history.filterEmptyDescription');
    }

    return (
        <MainContainer
            title={screenTitle}
            topBarLeftMode={exerciseDefinitionId ? 'back' : undefined}
            scroll={false}
            noPadding
            topBarOptions={topBarOptions}
            topBarLeftAction={topBarLeftAction}
            topBarRightAction={topBarRightAction}
        >
            <FlatList
                data={data}
                keyExtractor={(s) => getSessionKey(s.kind, s.id)}
                style={st.list}
                contentContainerStyle={st.listContent}
                ListHeaderComponent={
                    <View style={st.headerContainer}>
                        {definition && (
                            <AppText variant="subtitle">{definition.name}</AppText>
                        )}
                        {end !== undefined && Number.isFinite(end) && (
                            <AppText variant="caption" tone="secondary">
                                {t('statistics.sessionPeriod', {
                                    start:
                                        start === undefined ? t('statistics.period.all') : new Date(start).toLocaleDateString( locale, ),
                                    end: new Date(end - 1).toLocaleDateString(
                                        locale,
                                    ),
                                })}
                            </AppText>
                        )}
                        <SearchField<HistoryFilterKey, HistoryFilterKind>
                            value={search}
                            onChangeText={setSearch}
                            fullWidth
                            placeholder={t('history.searchPlaceholder')}
                            filters={{
                                applyLabel: t('history.filters.apply'),
                                clearLabel: t('history.filters.clear'),
                                defaultValues: { kind: 'all' },
                                sections: [
                                    {
                                        key: 'kind',
                                        title: t('history.filters.sessionType'),
                                        options: filterOptions,
                                    },
                                ],
                                title: t('history.filters.title'),
                                values: { kind: selectedKind },
                                onApply: (values) =>
                                    setSelectedKind(values.kind ?? 'all'),
                            }}
                        />
                        <ErrorBanner
                            message={errorMessage}
                            onClose={handleCloseError}
                        />
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => (
                    <TrainingSessionListItem
                        session={item}
                        onPress={() =>
                            router.push(getSessionRoute(item.kind, item.id))
                        }
                        isSelectMode={isSelectMode}
                        isSelected={isSelected(getSessionKey(item.kind, item.id))}
                        onSelect={() =>
                            toggleItem(getSessionKey(item.kind, item.id))
                        }
                    />
                )}
                ListEmptyComponent={
                    !isPending && !isError ? ( <ListEmptyState title={emptyTitle} description={emptyDescription} /> ) : null
                }
                ListFooterComponent={
                    <>
                        {(isPending || isFetchingNextPage) && (
                            <ActivityIndicator
                                color={theme.palette.accent.primary}
                            />
                        )}
                        {isError && (
                            <Button
                                title={t('statistics.retry')}
                                variant="secondary"
                                onPress={async () => {
                                    await refetch();
                                }}
                            />
                        )}
                    </>
                }
                onEndReached={async () => {
                    if (hasNextPage && !isFetchingNextPage && !isError)
                        await fetchNextPage();
                }}
                onEndReachedThreshold={0.4}
            />

            <ConfirmDialog
                visible={hasPendingRemoval}
                title={confirmTitle}
                message={confirmMessage}
                confirmLabel={t('historySession.actions.delete')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={confirmRemoval}
                onCancel={cancelRemoval}
            />
        </MainContainer>
    );
};

export default HistoryScreen;
