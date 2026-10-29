import { useMemo, useRef, useState } from 'react';
import type { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GymSessionAction } from '@src/components/gym/GymSessionAction/GymSessionAction';
import { GymSessionActionBar } from '@src/components/gym/GymSessionActionBar/GymSessionActionBar';
import { TopBarOptionsMenu } from '@src/components/navigation/TopBar/TopBarOptionsMenu/TopBarOptionsMenu';
import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';

interface GymExerciseDataFooterProps {
    hasSelection: boolean;
    isAddingSet: boolean;
    isSelectMode: boolean;
    onAddSet: () => void;
    onBack: () => void;
    onDeleteSelected: () => void;
    onEnterSelectMode: () => void;
    onExitSelectMode: () => void;
    onSelectAll: () => void;
    onTrackingFields: () => void;
}

export const GymExerciseDataFooter = ({
    hasSelection,
    isAddingSet,
    isSelectMode,
    onAddSet,
    onBack,
    onDeleteSelected,
    onEnterSelectMode,
    onExitSelectMode,
    onSelectAll,
    onTrackingFields,
}: GymExerciseDataFooterProps) => {
    const { t } = useTranslation();
    const optionsAnchorRef = useRef<View | null>(null);
    const [isOptionsVisible, setOptionsVisible] = useState(false);
    const options = useMemo<readonly TopBarOption[]>(
        () => [
            {
                id: 'tracking-fields',
                label: t('gymExerciseData.actions.trackingFields'),
                icon: 'edit',
                onPress: onTrackingFields,
            },
            {
                id: 'select',
                label: t('common.selectMode.enter'),
                icon: 'checkmark',
                onPress: onEnterSelectMode,
            },
        ],
        [onEnterSelectMode, onTrackingFields, t],
    );

    if (isSelectMode) {
        return (
            <GymSessionActionBar>
                <GymSessionAction
                    icon="close"
                    label={t('common.actions.cancel')}
                    onPress={onExitSelectMode}
                />
                <GymSessionAction
                    icon="checkmark"
                    label={t('common.selectMode.selectAll')}
                    onPress={onSelectAll}
                    isWide
                />
                <GymSessionAction
                    icon="trash"
                    label={t('gymExerciseData.actions.deleteSet')}
                    onPress={onDeleteSelected}
                    isDisabled={!hasSelection}
                    isDestructive
                />
            </GymSessionActionBar>
        );
    }

    return (
        <>
            <GymSessionActionBar>
                <GymSessionAction
                    icon="back"
                    label={t('common.actions.back')}
                    onPress={onBack}
                />
                <GymSessionAction
                    icon="add"
                    label={t('gymExerciseData.actions.addSet')}
                    onPress={onAddSet}
                    isDisabled={isAddingSet}
                    isPrimary
                />
                <GymSessionAction
                    icon="options"
                    label={t('gymExerciseData.actions.options')}
                    onPress={() => setOptionsVisible(true)}
                    anchorRef={optionsAnchorRef}
                />
            </GymSessionActionBar>
            <TopBarOptionsMenu
                visible={isOptionsVisible}
                anchorRef={optionsAnchorRef}
                options={options}
                onClose={() => setOptionsVisible(false)}
            />
        </>
    );
};
