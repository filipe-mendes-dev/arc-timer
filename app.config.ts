import type { ExpoConfig } from 'expo/config';

const VARIANTS = [
    'development',
    'preview',
    'production',
    'screenshots',
] as const;
type Variant = (typeof VARIANTS)[number];

const rawVariant = process.env.APP_VARIANT ?? 'production';
if (!VARIANTS.includes(rawVariant as Variant)) {
    throw new Error(
        `[app.config] Invalid APP_VARIANT="${rawVariant}". Expected one of: ${VARIANTS.join(', ')}.`,
    );
}
const variant = rawVariant as Variant;

type AndroidConfig = NonNullable<ExpoConfig['android']> & {
    predictiveBackGestureEnabled?: boolean;
};
type Config = Omit<ExpoConfig, 'android'> & {
    android: AndroidConfig;
    newArchEnabled?: boolean;
};

const baseId = 'dev.filipemendes.arctimer';

const getBundleId = (): string => {
    if (variant === 'development') return `${baseId}.dev`;
    if (variant === 'preview') return `${baseId}.preview`;
    if (variant === 'screenshots') return `${baseId}.screenshots`;

    return baseId;
};

const getName = (): string => {
    if (variant === 'development') return 'Arc Timer (Dev)';
    if (variant === 'preview') return 'Arc Timer (Preview)';
    if (variant === 'screenshots') return 'Arc Timer (Screenshots)';

    return 'Arc Timer';
};

const getScheme = (): string => {
    if (variant === 'development') return 'arctimer-dev';
    if (variant === 'preview') return 'arctimer-preview';
    if (variant === 'screenshots') return 'arctimer-screenshots';

    return 'arctimer';
};

const bundleId = getBundleId();
const name = getName();
const scheme = getScheme();

const config: Config = {
    name,
    slug: 'arc-timer',
    version: '1.1.1',
    orientation: 'portrait',
    icon: './assets/generated/classic/icon-light.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    scheme,
    ios: {
        icon: {
            light: './assets/generated/classic/icon-light.png',
            dark: './assets/generated/classic/icon-dark.png',
            tinted: './assets/generated/classic/icon-tinted.png',
        },
        bundleIdentifier: bundleId,
        buildNumber: '4',
        supportsTablet: false,
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
        },
    },
    android: {
        icon: './assets/generated/classic/icon-light.png',
        package: bundleId,
        versionCode: 5,
        adaptiveIcon: {
            foregroundImage:
                './assets/generated/classic/adaptive-foreground.png',
            monochromeImage:
                './assets/generated/classic/adaptive-monochrome.png',
            backgroundColor: '#ffffff',
        },
        blockedPermissions: [
            'android.permission.RECORD_AUDIO',
            'android.permission.SYSTEM_ALERT_WINDOW',
            'android.permission.FOREGROUND_SERVICE',
            'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
        ],
        predictiveBackGestureEnabled: false,
    },
    web: {
        favicon: './assets/favicon.png',
    },
    extra: {
        appVariant: variant,
    },
    plugins: [
        'expo-router',
        [
            'expo-audio',
            {
                microphonePermission: false,
                recordAudioAndroid: false,
                enableBackgroundPlayback: false,
            },
        ],
        'expo-font',
        'expo-localization',
        'expo-asset',
        [
            'expo-splash-screen',
            {
                image: './assets/generated/classic/splash-light.png',
                imageWidth: 200,
                resizeMode: 'contain',
                backgroundColor: '#F6F3EB',
                dark: {
                    image: './assets/generated/classic/splash-dark.png',
                    backgroundColor: '#000000',
                },
            },
        ],
        'expo-sqlite',
    ],
};

export default config;
