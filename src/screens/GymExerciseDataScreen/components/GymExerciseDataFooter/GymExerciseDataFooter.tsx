import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
    View,
    type StyleProp,
    type View as ReactNativeView,
    type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { FooterBar } from '@src/components/layout/FooterBar';
import { TopBarOptionsMenu } from '@src/components/navigation/TopBar/TopBarOptionsMenu/TopBarOptionsMenu';
import type { TopBarOption } from '@src/components/navigation/TopBar/TopBar.interfaces';
import { CircleIconButton } from '@src/components/ui/CircleIconButton/CircleIconButton';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './GymExerciseDataFooter.styles';

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

interface FooterActionProps {
    children: ReactNode;
    label: string;
    style?: StyleProp<ViewStyle>;
}

const FooterAction = ({ children, label, style }: FooterActionProps) => {
    const st = useStyles();

    return (
        <View style={[st.actionItem, style]}>
            {children}
            <AppText variant="caption" style={st.actionLabel} numberOfLines={1}>
                {label}
            </AppText>
        </View>
    );
};

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
    const { theme } = useTheme();
    const st = useStyles();
    const optionsAnchorRef = useRef<ReactNativeView | null>(null);
    const [isOptionsVisible, setOptionsVisible] = useState(false);
    const secondaryIconColor = theme.palette.button.text.secondary;
    const errorIconColor = theme.palette.icon.error;
    const deleteIconColor = hasSelection ? errorIconColor : secondaryIconColor;
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
            <FooterBar containerStyle={st.root}>
                <FooterAction label={t('common.actions.cancel')}>
                    <CircleIconButton
                        onPress={onExitSelectMode}
                        variant="secondary"
                        size={54}
                    >
                        <AppIcon
                            id="close"
                            size={24}
                            color={secondaryIconColor}
                        />
                    </CircleIconButton>
                </FooterAction>

                <FooterAction
                    label={t('common.selectMode.selectAll')}
                    style={st.primaryActionItem}
                >
                    <CircleIconButton
                        onPress={onSelectAll}
                        variant="secondary"
                        size={62}
                    >
                        <AppIcon
                            id="checkmark"
                            size={24}
                            color={secondaryIconColor}
                        />
                    </CircleIconButton>
                </FooterAction>

                <FooterAction label={t('gymExerciseData.actions.deleteSet')}>
                    <CircleIconButton
                        disabled={!hasSelection}
                        onPress={onDeleteSelected}
                        variant="secondary"
                        size={54}
                    >
                        <AppIcon
                            id="trash"
                            size={22}
                            color={deleteIconColor}
                        />
                    </CircleIconButton>
                </FooterAction>
            </FooterBar>
        );
    }

    return (
        <FooterBar containerStyle={st.root}>
            <FooterAction label={t('common.actions.back')}>
                <CircleIconButton
                    onPress={onBack}
                    variant="secondary"
                    size={54}
                >
                    <AppIcon
                        id="back"
                        size={22}
                        color={secondaryIconColor}
                    />
                </CircleIconButton>
            </FooterAction>

            <FooterAction
                label={t('gymExerciseData.actions.addSet')}
                style={st.primaryActionItem}
            >
                <CircleIconButton
                    disabled={isAddingSet}
                    onPress={onAddSet}
                    variant="primary"
                    size={72}
                >
                    <AppIcon
                        id="add"
                        size={32}
                        color={theme.palette.text.inverted}
                    />
                </CircleIconButton>
            </FooterAction>

            <FooterAction label={t('gymExerciseData.actions.options')}>
                <View ref={optionsAnchorRef}>
                    <CircleIconButton
                        onPress={() => setOptionsVisible(true)}
                        variant="secondary"
                        size={54}
                    >
                        <AppIcon
                            id="options"
                            size={22}
                            color={secondaryIconColor}
                        />
                    </CircleIconButton>
                </View>

                <TopBarOptionsMenu
                    visible={isOptionsVisible}
                    anchorRef={optionsAnchorRef}
                    options={options}
                    onClose={() => setOptionsVisible(false)}
                />
            </FooterAction>
        </FooterBar>
    );
};
