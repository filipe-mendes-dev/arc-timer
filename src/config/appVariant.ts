import Constants from 'expo-constants';

const APP_VARIANTS = [
    'development',
    'preview',
    'production',
    'screenshots',
] as const;

export type AppVariant = (typeof APP_VARIANTS)[number];

interface ExpoExtraConfig {
    appVariant?: unknown;
}

const isAppVariant = (value: unknown): value is AppVariant =>
    typeof value === 'string' &&
    APP_VARIANTS.includes(value as AppVariant);

const extra = Constants.expoConfig?.extra as ExpoExtraConfig | undefined;
const extraAppVariant = extra?.appVariant;

const resolveAppVariant = (): AppVariant => {
    if (isAppVariant(extraAppVariant)) return extraAppVariant;

    return 'production';
};

export const appVariant = resolveAppVariant();

export const isScreenshotVariant = appVariant === 'screenshots';
