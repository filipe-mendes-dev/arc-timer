import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { dbServices } from '@src/db/dbServices';
import i18n from '@src/i18n';
import { useSettingsStore } from '@src/state/useSettingsStore';
import { gymSessionNotifications } from '../../../modules/gym-session-notifications';
import { createGymSessionPresentation, type GymSessionPresentation } from './gymSessionPresentation';

export const GYM_SESSION_CATEGORY = 'gymSession';
export const END_GYM_SESSION_ACTION = 'endGymSession';
const REMINDER_CHANNEL = 'gym_session_reminders';
const REMINDER_PREFIX = 'gym-session-reminder:';
const REMINDER_DELAY_MS = 90 * 60 * 1000;

let synchronization = Promise.resolve();
let revision = 0;
let lastPresentation = '';

if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

const reportNotificationError = (error: unknown): void => {
    console.warn('Gym session notification failed', error);
};

const hasNotificationPermission = async (): Promise<boolean> => {
    const permission = await Notifications.getPermissionsAsync();
    return permission.granted ||
        permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
};

export const requestGymSessionNotificationPermission = async (): Promise<void> => {
    if (Platform.OS === 'web') return;

    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
                name: i18n.t('gymNotifications.reminderChannelName'),
                importance: Notifications.AndroidImportance.DEFAULT,
            });
        }
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
        let presentation: GymSessionPresentation | undefined;
        if (session) {
            presentation = createGymSessionPresentation(session);
            const serialized = JSON.stringify(presentation);
            if (shouldRefresh || serialized !== lastPresentation) {
                const didPresent = await gymSessionNotifications?.present(serialized).catch(reportNotificationError);
                if (typeof didPresent === 'boolean') lastPresentation = serialized;
            }
        } else {
            await gymSessionNotifications?.dismiss().catch(reportNotificationError);
            lastPresentation = '';
        }
        const reminderId = session ? `${REMINDER_PREFIX}${session.id}` : undefined;
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduled) {
            if (notification.identifier.startsWith(REMINDER_PREFIX) && notification.identifier !== reminderId) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }
        const presented = await Notifications.getPresentedNotificationsAsync();
        for (const notification of presented) {
            if (notification.request.identifier.startsWith(REMINDER_PREFIX) && notification.request.identifier !== reminderId) {
                await Notifications.dismissNotificationAsync(notification.request.identifier);
            }
        }

        if (!session || !presentation) return;
        if (!(await hasNotificationPermission())) return;
        await Notifications.setNotificationCategoryAsync(GYM_SESSION_CATEGORY, [{
            identifier: END_GYM_SESSION_ACTION,
            buttonTitle: presentation.endLabel,
            options: { opensAppToForeground: true },
        }]);

        const reminderAt = session.startedAtMs + REMINDER_DELAY_MS;
        if (reminderAt <= Date.now()) return;
        const title = i18n.t('gymNotifications.reminderTitle');
        const body = i18n.t('gymNotifications.reminderBody');
        const existing = scheduled.find((notification) => notification.identifier === reminderId);
        if (existing?.content.title === title && existing.content.body === body && existing.content.data?.accentColor === presentation.accentColor) return;
        if (existing) await Notifications.cancelScheduledNotificationAsync(existing.identifier);
        if (requestedRevision !== revision) return;

        await Notifications.scheduleNotificationAsync({
            identifier: reminderId,
            content: {
                title,
                body,
                color: presentation.accentColor,
                categoryIdentifier: GYM_SESSION_CATEGORY,
                data: { kind: GYM_SESSION_CATEGORY, sessionId: session.id, accentColor: presentation.accentColor },
                sound: 'default',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(reminderAt),
                channelId: REMINDER_CHANNEL,
            },
        });
    });

    return synchronization.catch(reportNotificationError);
};
