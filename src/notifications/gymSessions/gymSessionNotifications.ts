import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { dbServices } from '@src/db/dbServices';
import i18n from '@src/i18n';
import { useSettingsStore } from '@src/state/useSettingsStore';
import { gymSessionNotifications } from '../../../modules/gym-session-notifications';
import { createGymSessionPresentation } from './gymSessionPresentation';

const ACTIVE_SESSION_CHANNEL = 'gym_session_active';
const LEGACY_REMINDER_PREFIX = 'gym-session-reminder:';

let synchronization = Promise.resolve();
let revision = 0;
let lastPresentation = '';

if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
            const shouldPresent = !notification.request.identifier.startsWith(LEGACY_REMINDER_PREFIX);
            return {
                shouldShowBanner: shouldPresent,
                shouldShowList: shouldPresent,
                shouldPlaySound: shouldPresent,
                shouldSetBadge: false,
            };
        },
    });
}

const reportNotificationError = (error: unknown): void => {
    console.warn('Gym session notification failed', error);
};

export const requestGymSessionNotificationPermission = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;

    try {
        await Notifications.setNotificationChannelAsync(ACTIVE_SESSION_CHANNEL, {
            name: i18n.t('gymNotifications.channelName'),
            importance: Notifications.AndroidImportance.LOW,
            sound: null,
            enableVibrate: false,
        });
        const permission = await Notifications.getPermissionsAsync();
        if (permission.status === 'undetermined' && permission.canAskAgain) {
            await Notifications.requestPermissionsAsync();
        }
    } catch (error: unknown) {
        reportNotificationError(error);
    }
};

export const synchronizeGymSessionNotifications = (shouldRefresh = false): Promise<void> => {
    if (Platform.OS === 'web') return Promise.resolve();
    const requestedRevision = ++revision;

    synchronization = synchronization.catch(reportNotificationError).then(async () => {
        if (!useSettingsStore.persist.hasHydrated()) return;
        if (requestedRevision !== revision) return;

        const session = dbServices.gymSessionService.getActiveGymSession();
        const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch((error: unknown) => {
            reportNotificationError(error);
            return [];
        });
        for (const notification of scheduled) {
            if (notification.identifier.startsWith(LEGACY_REMINDER_PREFIX)) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier).catch(reportNotificationError);
            }
        }
        const presented = await Notifications.getPresentedNotificationsAsync().catch((error: unknown) => {
            reportNotificationError(error);
            return [];
        });
        for (const notification of presented) {
            if (notification.request.identifier.startsWith(LEGACY_REMINDER_PREFIX)) {
                await Notifications.dismissNotificationAsync(notification.request.identifier).catch(reportNotificationError);
            }
        }
        if (requestedRevision !== revision) return;

        if (session) {
            const presentation = createGymSessionPresentation(session);
            const serialized = JSON.stringify(presentation);
            if (shouldRefresh || serialized !== lastPresentation) {
                const didPresent = await gymSessionNotifications?.present(serialized).catch(reportNotificationError);
                if (typeof didPresent === 'boolean') lastPresentation = serialized;
            }
        } else {
            await gymSessionNotifications?.dismiss().catch(reportNotificationError);
            lastPresentation = '';
        }
    });

    return synchronization.catch(reportNotificationError);
};
