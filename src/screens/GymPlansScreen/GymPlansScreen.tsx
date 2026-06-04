import { FlatList, View } from 'react-native';
import type { TFunction } from 'i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
import { Button } from '@src/components/ui/Button/Button';
import { ErrorBanner } from '@src/components/ui/ErrorBanner/ErrorBanner';
import { SearchField } from '@src/components/ui/SearchField/SearchField';

import { GymPlanItem } from './components/GymPlanItem';
import { NewGymPlanModal } from './components/NewGymPlanModal';
import { useGymPlansScreenStyles } from './GymPlansScreen.styles';
import { useGymPlansSelection } from './useGymPlansSelection';
import { useGymPlansScreen } from './useGymPlansScreen';

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
    const screen = useGymPlansScreen();
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
                data={screen.filteredGymPlans}
                keyExtractor={(item) => item.id}
                style={st.list}
                contentContainerStyle={st.listContent}
                ListHeaderComponent={
                    <View style={st.headerContainer}>
                        <View style={st.headerRow}>
                            <SearchField
                                value={screen.search}
                                onChangeText={screen.setSearch}
                                fullWidth
                                placeholder={screen.t(
                                    'gymPlans.searchPlaceholder',
                                )}
                            />
                            {!selection.isSelectMode && (
                                <Button
                                    title={screen.t('gymPlans.actions.new')}
                                    variant="primary"
                                    onPress={screen.openNewPlanModal}
                                    loading={screen.isStartingDraft}
                                    style={st.newButton}
                                />
                            )}
                        </View>
                        <ErrorBanner
                            message={screen.importError}
                            onClose={() => screen.setImportError('')}
                        />
                    </View>
                }
                stickyHeaderIndices={[0]}
                renderItem={({ item }) => (
                    <GymPlanItem
                        item={item}
                        onPress={() => screen.goToPlan(item.id)}
                        onRemove={() => selection.requestRemoval(item.id)}
                        isSelectMode={selection.isSelectMode}
                        isSelected={selection.isSelected(item.id)}
                        onSelect={() => selection.toggleItem(item.id)}
                        onToggleFavorite={() => screen.toggleFavoritePlan(item)}
                    />
                )}
                ListEmptyComponent={
                    <GymPlansEmptyState
                        hasSearch={screen.hasSearch}
                        onNewPlan={screen.openNewPlanModal}
                        t={screen.t}
                    />
                }
                keyboardShouldPersistTaps="handled"
            />

            <NewGymPlanModal
                visible={screen.isNewPlanModalVisible}
                hasRecoverableDraft={screen.hasRecoverableDraft}
                isImporting={screen.isImporting}
                isStartingDraft={screen.isStartingDraft}
                onClose={screen.closeNewPlanModal}
                onCreateNew={screen.handleNewPlan}
                onImportFromFile={screen.handleImportFromFile}
                onResumeDraft={screen.handleResumeDraft}
            />

            <ConfirmDialog
                visible={selection.hasPendingRemoval}
                title={selection.confirmTitle}
                message={selection.confirmMessage}
                confirmLabel={screen.t('gymPlans.confirmRemove.confirm')}
                cancelLabel={screen.t('common.actions.cancel')}
                destructive
                onConfirm={selection.confirmRemoval}
                onCancel={selection.cancelRemoval}
            />
        </MainContainer>
    );
};

export default GymPlansScreen;
