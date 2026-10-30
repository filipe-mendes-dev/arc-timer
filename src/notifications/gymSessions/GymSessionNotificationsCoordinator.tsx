import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

import { useActiveGymSession } from '@src/data/gymSessions';
import { useSettingsStore } from '@src/state/useSettingsStore';
import { useTheme } from '@src/theme/ThemeProvider';
import {
    END_GYM_SESSION_ACTION,
    GYM_SESSION_CATEGORY,
    synchronizeGymSessionNotifications,
} from './gymSessionNotifications';

export const GymSessionNotificationsCoordinator = () => {
    const { data: activeSession } = useActiveGymSession();
    const { theme } = useTheme();
    const { i18n } = useTranslation();
    const router = useRouter();
    const activeSessionId = activeSession?.id;
    const planName = activeSession?.sourceGymPlanName;
    const currentSessionId = useRef(activeSessionId);
    currentSessionId.current = activeSessionId;

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
        const handledResponses = new Set<string>();
        const handleResponse = (response: Notifications.NotificationResponse) => {
            const data: unknown = response.notification.request.content.data;
            if (typeof data !== 'object' || data === null) return;
            if (!('kind' in data) || data.kind !== GYM_SESSION_CATEGORY) return;
            if (!('sessionId' in data) || typeof data.sessionId !== 'string') return;

            const responseKey = `${response.notification.request.identifier}:${response.actionIdentifier}`;
            if (handledResponses.has(responseKey)) return;
            handledResponses.add(responseKey);
            Notifications.clearLastNotificationResponse();
            if (data.sessionId !== currentSessionId.current) return;

            let notificationAction: string | undefined;
            if (response.actionIdentifier === END_GYM_SESSION_ACTION) notificationAction = 'end';
            router.navigate({
                pathname: '/gymSession',
                params: { sessionId: data.sessionId, notificationAction },
            });
        };

        const listener = Notifications.addNotificationResponseReceivedListener(handleResponse);
        const response = Notifications.getLastNotificationResponse();
        if (response) handleResponse(response);
        return () => {
            hydrate();
            foreground.remove();
            listener.remove();
        };
    }, [router]);

    return null;
};
