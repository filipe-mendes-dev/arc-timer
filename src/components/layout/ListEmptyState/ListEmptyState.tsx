import React from 'react';
import { View } from 'react-native';

import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useListEmptyStateStyles } from './ListEmptyState.styles';
import { TextVariant } from 'src/theme/typography';

interface ListEmptyStateProps {
    actionLabel?: string;
    description: string;
    onPressAction?: () => void;
    title: string;
    size?: 'default' | 'small';
}

interface SizeVariants {
    title: TextVariant;
    description: TextVariant;
}

export const ListEmptyState = ({
    actionLabel,
    description,
    onPressAction,
    title,
    size = 'default',
}: ListEmptyStateProps) => {
    const st = useListEmptyStateStyles();
    const hasAction = !!actionLabel && !!onPressAction;

    const handleSize = (value: string): SizeVariants => {
        if (value === 'small') {
            return { title: 'body', description: 'label' };
        }
        return { title: 'title3', description: 'bodySmall' };
    };

    const textVariants = handleSize(size);

    return (
        <View style={st.container}>
            <AppText variant={textVariants.title}>{title}</AppText>

            <AppText
                variant={textVariants.description}
                tone="secondary"
                style={st.description}
            >
                {description}
            </AppText>

            {hasAction ? (
                <Button
                    title={actionLabel}
                    variant="primary"
                    onPress={onPressAction}
                    style={st.button}
                />
            ) : null}
        </View>
    );
};
