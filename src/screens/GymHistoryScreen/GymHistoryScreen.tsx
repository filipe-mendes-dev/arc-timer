import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { useGymSessionListItems } from '@src/data/gymSessions';
import type { GymSessionListItem as GymSessionListItemEntity } from '@src/core/entities/gymSession.interfaces';

import { GymSessionListItem } from './components/GymSessionListItem/GymSessionListItem';
import { useStyles } from './GymHistoryScreen.styles';
import { useGymHistorySelection } from './useGymHistorySelection';

const getSessionTitle = (
    session: GymSessionListItemEntity,
    t: TFunction,
): string => session.sourceGymPlanName ?? t('gymHistory.sessionTitle');

const GymHistoryScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const st = useStyles();
    const selection = useGymHistorySelection();
    const { data: sessions = [] } = useGymSessionListItems();
    const [search, setSearch] = useState('');

    const data = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        if (!searchTerm) return sessions;

        return sessions.filter((session) => {
            const searchText = getSessionTitle(session, t);

            return searchText.toLowerCase().includes(searchTerm);
        });
    }, [search, sessions, t]);
    const hasSearch = search.trim().length > 0;

    let emptyTitle = t('gymHistory.emptyTitle');
    let emptyDescription = t('gymHistory.emptyDescription');

    if (hasSearch) {
        emptyTitle = t('gymHistory.searchEmptyTitle');
        emptyDescription = t('gymHistory.searchEmptyDescription');
    }

    return (
        <MainContainer
            title={selection.screenTitle}
            scroll={false}
            noPadding
            topBarOptions={selection.topBarOptions}
            topBarLeftAction={selection.topBarLeftAction}
            topBarRightAction={selection.topBarRightAction}
        >
            <FlatList
                data={data}
                keyExtractor={(session) => session.id}
                style={st.list}
                contentContainerStyle={st.listContent}
                ListHeaderComponent={
                    <View style={st.headerRow}>
                        <SearchField
                            value={search}
                            onChangeText={setSearch}
                            fullWidth
                            placeholder={t('gymHistory.searchPlaceholder')}
                        />
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => (
                    <GymSessionListItem
                        isSelectMode={selection.isSelectMode}
                        isSelected={selection.isSelected(item.id)}
                        session={item}
                        onSelect={() => selection.toggleItem(item.id)}
                        onPress={() => router.push(`/gymHistory/${item.id}`)}
                    />
                )}
                ListEmptyComponent={
                    <ListEmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                    />
                }
                keyboardShouldPersistTaps="handled"
            />

            <ConfirmDialog
                visible={selection.hasPendingRemoval}
                title={selection.confirmTitle}
                message={selection.confirmMessage}
                confirmLabel={t('gymSessionSummary.actions.delete')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={selection.confirmRemoval}
                onCancel={selection.cancelRemoval}
            />
        </MainContainer>
    );
};

export default GymHistoryScreen;
