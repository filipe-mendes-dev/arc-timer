import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { useGymPlans } from '@src/data/gymPlans';
import { useGymSessions } from '@src/data/gymSessions';

import GymSessionListItem from './components/GymSessionListItem/GymSessionListItem';
import { useStyles } from './GymHistoryScreen.styles';
import { useGymHistorySelection } from './useGymHistorySelection';

const GymHistoryScreen = () => {
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const st = useStyles();
    const selection = useGymHistorySelection();
    const { data: gymPlans = [] } = useGymPlans(true);
    const { data: sessions = [] } = useGymSessions();
    const [search, setSearch] = useState('');
    const locale = i18n.resolvedLanguage ?? i18n.language;

    const gymPlanNameById = useMemo(
        () => new Map(gymPlans.map((gymPlan) => [gymPlan.id, gymPlan.name])),
        [gymPlans],
    );

    const getSessionTitle = (sourceGymPlanId?: string): string => {
        if (!sourceGymPlanId) return t('gymHistory.sessionTitle');

        return (
            gymPlanNameById.get(sourceGymPlanId) ?? t('gymHistory.sessionTitle')
        );
    };

    const data = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        if (!searchTerm) return sessions;

        return sessions.filter((session) => {
            const startedAtLabel = new Date(
                session.startedAtMs,
            ).toLocaleDateString(locale, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });

            return startedAtLabel.toLowerCase().includes(searchTerm);
        });
    }, [locale, search, sessions]);
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
                        title={getSessionTitle(item.sourceGymPlanId)}
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
