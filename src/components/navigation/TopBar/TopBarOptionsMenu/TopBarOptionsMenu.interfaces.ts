import type { RefObject } from 'react';
import type { ViewInstance } from 'react-native';

import type { TopBarOption } from '../TopBar.interfaces';

export interface TopBarOptionsMenuProps {
    visible: boolean;
    anchorRef: RefObject<ViewInstance | null>;
    options: readonly TopBarOption[];
    onClose: () => void;
}
