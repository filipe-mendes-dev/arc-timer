import { useTranslation } from 'react-i18next';

import { GymSessionAction } from '@src/components/gym/GymSessionAction/GymSessionAction';
import { GymSessionActionBar } from '@src/components/gym/GymSessionActionBar/GymSessionActionBar';

interface GymActiveSessionFooterProps {
    onAddExercise: () => void;
    onBack: () => void;
    onEnd: () => void;
}

export const GymActiveSessionFooter = ({
    onAddExercise,
    onBack,
    onEnd,
}: GymActiveSessionFooterProps) => {
    const { t } = useTranslation();

    return (
        <GymSessionActionBar>
            <GymSessionAction
                icon="back"
                label={t('common.actions.back')}
                onPress={onBack}
            />
            <GymSessionAction
                icon="add"
                label={t('gymActiveSession.actions.addExercise')}
                onPress={onAddExercise}
                isPrimary
            />
            <GymSessionAction
                icon="end"
                label={t('gymActiveSession.actions.end')}
                onPress={onEnd}
            />
        </GymSessionActionBar>
    );
};
