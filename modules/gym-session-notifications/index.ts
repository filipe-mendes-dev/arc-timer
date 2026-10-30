import { requireOptionalNativeModule } from 'expo';

interface GymSessionNotificationsModule {
    present: (presentation: string) => Promise<boolean>;
    dismiss: () => Promise<void>;
}

export const gymSessionNotifications =
    requireOptionalNativeModule<GymSessionNotificationsModule>(
        'GymSessionNotifications',
    );
