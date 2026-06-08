import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import type { TrainingSessionKind } from '@src/core/entities/trainingSession.interfaces';
import { useTrainingSessionListItems } from '@src/data/trainingSessions';
import { useStyles } from './HistoryScreen.styles';
import { TrainingSessionListItem } from './components/TrainingSessionListItem';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { useTranslation } from 'react-i18next';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import { useHistorySelection } from './useHistorySelection';

type HistoryFilterKind = TrainingSessionKind | 'all';
type HistoryFilterKey = 'kind';

interface HistoryFilterOption {
    value: HistoryFilterKind;
    label: string;
}

const getSessionKey = (
    kind: TrainingSessionKind,
    sessionId: string,
): string => `${kind}:${sessionId}`;

const getSessionRoute = (
    kind: TrainingSessionKind,
    sessionId: string,
): `/history/${string}` | `/gymHistory/${string}` => {
    if (kind === 'hiit') return `/history/${sessionId}`;

    return `/gymHistory/${sessionId}`;
};

const HistoryScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const st = useStyles();

    const [search, setSearch] = useState('');
    const [selectedKind, setSelectedKind] =
        useState<HistoryFilterKind>('all');
    let queryKind: TrainingSessionKind | undefined;
    if (selectedKind !== 'all') {
        queryKind = selectedKind;
    }

    const { data: sessions = [] } = useTrainingSessionListItems({
        kind: queryKind,
        limit: 100,
    });

    const data = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        if (!searchTerm) return sessions;
        return sessions.filter((session) => {
            return session.searchText.toLowerCase().includes(searchTerm);
        });
    }, [search, sessions]);
    const hasSearch = search.trim().length > 0;
    const hasAnySessions = sessions.length > 0;

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
                                        title: t(
                                            'history.filters.sessionType',
                                        ),
                                        options: filterOptions,
                                    },
                                ],
                                title: t('history.filters.title'),
                                values: { kind: selectedKind },
                                onApply: (values) =>
                                    setSelectedKind(values.kind ?? 'all'),
                            }}
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
                        isSelected={isSelected(
                            getSessionKey(item.kind, item.id),
                        )}
                        onSelect={() =>
                            toggleItem(getSessionKey(item.kind, item.id))
                        }
                    />
                )}
                ListEmptyComponent={
                    <ListEmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                    />
                }
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
