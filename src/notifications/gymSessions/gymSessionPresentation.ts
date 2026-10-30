import Constants from 'expo-constants';
import { applicationId } from 'expo-application';
import i18n from '@src/i18n';
import type { GymSession } from '@src/core/entities/gymSession.interfaces';
import { formatShortTime } from '@src/helpers/time.helpers';
import { useSettingsStore } from '@src/state/useSettingsStore';
import { COLOR_ACCENTS, buildDarkPalette, buildLightPalette } from '@src/theme/palette';
import { Appearance } from 'react-native';
import { colors } from '@src/theme/colors';

const APP_SCHEMES: Record<string, string | undefined> = {
    'dev.filipemendes.arctimer': 'arctimer',
    'dev.filipemendes.arctimer.dev': 'arctimer-dev',
    'dev.filipemendes.arctimer.preview': 'arctimer-preview',
    'dev.filipemendes.arctimer.screenshots': 'arctimer-screenshots',
};

export interface GymSessionPresentation {
    sessionId: string;
    startedAtMs: number;
    title: string;
    planName: string;
    startedAtLabel: string;
    elapsedLabel: string;
    endLabel: string;
    channelName: string;
    appName: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    secondaryTextColor: string;
    buttonTextColor: string;
    openUrl: string;
    endUrl: string;
}

export const createGymSessionPresentation = (session: GymSession): GymSessionPresentation => {
    const { accentPreference, themePreference } = useSettingsStore.getState();
    const accent = COLOR_ACCENTS[accentPreference].tokens;
    const isDark = themePreference === 'dark' ||
        (themePreference === 'system' && Appearance.getColorScheme() === 'dark');
    const palette = isDark ? buildDarkPalette(accent) : buildLightPalette(accent);
    const locale = i18n.resolvedLanguage ?? i18n.language;
    const path = 'gymSession';
    const configuredScheme = Constants.expoConfig?.scheme;
    const fallbackScheme = typeof configuredScheme === 'string' ? configuredScheme : configuredScheme?.[0];
    // Metro can serve production config to a development app.
    const scheme = APP_SCHEMES[applicationId ?? ''] ?? fallbackScheme ?? 'arctimer';
    const queryParams = new URLSearchParams({ sessionId: session.id });
    const openUrl = `${scheme}://${path}?${queryParams.toString()}`;
    queryParams.set('notificationAction', 'end');
    const endUrl = `${scheme}://${path}?${queryParams.toString()}`;
    let buttonTextColor = palette.text.inverted;
    if (accentPreference !== 'neutral') buttonTextColor = accent.darkInk;
    if (accentPreference === 'neutral') buttonTextColor = colors.white.main;

    return {
        sessionId: session.id,
        startedAtMs: session.startedAtMs,
        title: i18n.t('gym.heading'),
        planName: session.sourceGymPlanName ?? i18n.t('gym.heading'),
        startedAtLabel: `${i18n.t('gymActiveSession.startedAt')} ${formatShortTime(session.startedAtMs, locale)}`,
        elapsedLabel: i18n.t('gymNotifications.elapsed'),
        endLabel: i18n.t('gym.actions.finishSession'),
        channelName: i18n.t('gymNotifications.channelName'),
        appName: `${Constants.expoConfig?.name ?? 'Arc Timer'} · ${i18n.t('gymActiveSession.status.live')}`,
        accentColor: accent.primary,
        backgroundColor: palette.background.card,
        textColor: palette.text.primary,
        secondaryTextColor: palette.text.secondary,
        buttonTextColor,
        openUrl,
        endUrl,
    };
};
