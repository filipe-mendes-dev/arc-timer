import { FlatList, View } from 'react-native';
import { useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { SearchField } from '@src/components/ui/SearchField/SearchField';
import { Button } from '@src/components/ui/Button/Button';
import { ListEmptyState } from '@src/components/layout/ListEmptyState';
import ConfirmDialog from '@src/components/modals/ConfirmDialog/ConfirmDialog';
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

const ExerciseDefinitionsScreen = () => {
    const { t } = useTranslation();
    const st = useExerciseDefinitionsScreenStyles();
    const list = useExerciseDefinitionsList();
    const selection = useExerciseDefinitionsSelection();

    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

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
                data={list.exerciseDefinitions}
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
                                placeholder={t(
                                    'exerciseDefinitions.searchPlaceholder',
                                )}
                            />

                            {!selection.isSelectMode && (
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
                renderItem={({ item }) => (
                    <ExerciseDefinitionCard
                        item={item}
                        onPress={() => list.goToExerciseDefinition(item.id)}
                        onRemove={() => selection.requestRemoval(item.id)}
                        isSelectMode={selection.isSelectMode}
                        isSelected={selection.isSelected(item.id)}
                        onSelect={() => selection.toggleItem(item.id)}
                    />
                )}
                ListEmptyComponent={
                    <ExerciseDefinitionsEmptyState
                        hasSearch={list.hasSearch}
                        onNewExercise={openModal}
                        t={t}
                    />
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
        </MainContainer>
    );
};

export default ExerciseDefinitionsScreen;
