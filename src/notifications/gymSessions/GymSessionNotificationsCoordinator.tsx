import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useActiveGymSession } from '@src/data/gymSessions';
import { useSettingsStore } from '@src/state/useSettingsStore';
import { useTheme } from '@src/theme/ThemeProvider';
import { synchronizeGymSessionNotifications } from './gymSessionNotifications';

export const GymSessionNotificationsCoordinator = () => {
    const { data: activeSession } = useActiveGymSession();
    const { theme } = useTheme();
    const { i18n } = useTranslation();
    const activeSessionId = activeSession?.id;
    const planName = activeSession?.sourceGymPlanName;

    useEffect(() => {
        synchronizeGymSessionNotifications().catch(console.warn);
    }, [activeSessionId, planName, theme.name, theme.palette.accent.primary, i18n.resolvedLanguage]);

    useEffect(() => {
        if (Platform.OS === 'web') return;
        const hydrate = useSettingsStore.persist.onFinishHydration(() => {
            synchronizeGymSessionNotifications(true).catch(console.warn);
        });
        const foreground = AppState.addEventListener('change', (state) => {
            if (state === 'active') synchronizeGymSessionNotifications(true).catch(console.warn);
        });
        return () => {
            hydrate();
            foreground.remove();
        };
    }, []);

    return null;
};
