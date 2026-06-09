import { FlatList, View } from 'react-native';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { SearchField } from '@src/components/ui/SearchField/SearchField';

import { GymPlanItem } from './components/GymPlanItem';
import { NewGymPlanModal } from './components/NewGymPlanModal';
import { useGymPlansScreenStyles } from './GymPlansScreen.styles';
import { useGymPlansList } from './hooks/useGymPlansList';
import { useGymPlansSelection } from './hooks/useGymPlansSelection';
import { useNewGymPlanFlow } from './hooks/useNewGymPlanFlow';

interface GymPlansEmptyStateProps {
    hasSearch: boolean;
    onNewPlan: () => void;
    t: TFunction;
}

const GymPlansEmptyState = ({
    hasSearch,
    onNewPlan,
    t,
}: GymPlansEmptyStateProps) => {
    if (hasSearch) {
        return (
            <ListEmptyState
                title={t('gymPlans.searchEmptyTitle')}
                description={t('gymPlans.searchEmptyDescription')}
            />
        );
    }

    return (
        <ListEmptyState
            title={t('gymPlans.emptyTitle')}
            description={t('gymPlans.emptyDescription')}
            actionLabel={t('gymPlans.actions.createPlan')}
            onPressAction={onNewPlan}
        />
    );
};

const GymPlansScreen = () => {
    const st = useGymPlansScreenStyles();
    const { t } = useTranslation();
    const list = useGymPlansList();
    const newPlan = useNewGymPlanFlow();
    const selection = useGymPlansSelection();

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
                data={list.filteredGymPlans}
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
                                placeholder={t('gymPlans.searchPlaceholder')}
                            />
                            {!selection.isSelectMode && (
                                <Button
                                    title={t('gymPlans.actions.new')}
                                    variant="primary"
                                    onPress={newPlan.openNewPlanModal}
                                    loading={newPlan.isStartingDraft}
                                    style={st.newButton}
                                />
                            )}
                        </View>
                        <ErrorBanner
                            message={newPlan.importError}
                            onClose={() => newPlan.setImportError('')}
                        />
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => (
                    <GymPlanItem
                        item={item}
                        onPress={() => list.goToPlan(item.id)}
                        onRemove={() => selection.requestRemoval(item.id)}
                        isSelectMode={selection.isSelectMode}
                        isSelected={selection.isSelected(item.id)}
                        onSelect={() => selection.toggleItem(item.id)}
                        onToggleFavorite={() =>
                            list.toggleFavoritePlan(item.id)
                        }
                    />
                )}
                ListEmptyComponent={
                    <GymPlansEmptyState
                        hasSearch={list.hasSearch}
                        onNewPlan={newPlan.openNewPlanModal}
                        t={t}
                    />
                }
                keyboardShouldPersistTaps="handled"
            />

            <NewGymPlanModal
                visible={newPlan.isNewPlanModalVisible}
                hasRecoverableDraft={newPlan.hasRecoverableDraft}
                isImporting={newPlan.isImporting}
                isStartingDraft={newPlan.isStartingDraft}
                onClose={newPlan.closeNewPlanModal}
                onCreateNew={newPlan.handleNewPlan}
                onImportFromFile={newPlan.handleImportFromFile}
                onResumeDraft={newPlan.handleResumeDraft}
            />

            <ConfirmDialog
                visible={selection.hasPendingRemoval}
                title={selection.confirmTitle}
                message={selection.confirmMessage}
                confirmLabel={t('gymPlans.confirmRemove.confirm')}
                cancelLabel={t('common.actions.cancel')}
                destructive
                onConfirm={selection.confirmRemoval}
                onCancel={selection.cancelRemoval}
            />
        </MainContainer>
    );
};

export default GymPlansScreen;
