import type { ReactNode } from 'react';

import { FooterBar } from '@src/components/layout/FooterBar';

import { useStyles } from './GymSessionActionBar.styles';

interface GymSessionActionBarProps {
    children: ReactNode;
}

export const GymSessionActionBar = ({ children }: GymSessionActionBarProps) => {
    const st = useStyles();

    return <FooterBar containerStyle={st.root}>{children}</FooterBar>;
};
