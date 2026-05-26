import { View } from 'react-native';

import { useStyles } from './Separator.styles';

export interface SeparatorProps {
    color?: string;
    height?: number;
    spacing?: 'none' | 'small' | 'medium' | 'large';
}

export const Separator = ({
    color,
    height,
    spacing = 'none',
}: SeparatorProps) => {
    const st = useStyles({ color, height, spacing });

    return <View style={st.root} />;
};
