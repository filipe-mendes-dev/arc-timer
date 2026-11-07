import { useTranslation } from 'react-i18next';
import { useSampleDataMutation } from '@src/data/development/sampleDataMutations';
import { SettingsSection } from '../SettingsSection';
import { SettingsSubSection } from '../SettingsSubSection';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useDevelopmentSettingsSectionStyles } from './DevelopmentSettingsSection.styles';
import { View } from 'react-native';
import { resources } from '@src/i18n';

export const DevelopmentSettingsSection = () => {
    const { t } = useTranslation();
    const sample = useSampleDataMutation();
    const st = useDevelopmentSettingsSectionStyles();
    return (
        <SettingsSection iconId="settings" title={t('settings.development.title')}>
            <SettingsSubSection description={t('settings.development.description')}>
                <View style={st.actions}>
                    <Button
                        title={t('settings.development.load')}
                        variant="secondary"
                        loading={sample.isPending && sample.variables !== undefined}
                        disabled={sample.isPending}
                        onPress={() =>
                            sample.mutate({
                                exerciseNames: [
                                    t('settings.development.sampleBench'),
                                    t('settings.development.samplePullUp'),
                                    t('settings.development.samplePlank'),
                                    t('settings.development.sampleRun'),
                                ],
                                hiitWorkoutNames: [
                                    t('settings.development.sampleHiit', {
                                        defaultValue: resources.en.translation.settings.development.sampleHiit,
                                    }),
                                    t('settings.development.sampleIntervals', {
                                        defaultValue: resources.en.translation.settings.development.sampleIntervals,
                                    }),
                                ],
                            })
                        }
                    />
                    <Button
                        title={t('settings.development.remove')}
                        variant="ghost"
                        loading={sample.isPending && sample.variables === undefined}
                        disabled={sample.isPending}
                        onPress={() => sample.mutate(undefined)}
                    />
                    {sample.isSuccess && (
                        <AppText
                            variant="bodySmall"
                            tone="success"
                            accessibilityLiveRegion="polite"
                        >
                            {t(
                                sample.variables === undefined ? 'settings.development.removed' : 'settings.development.loaded',
                            )}
                        </AppText>
                    )}
                    {sample.isError && (
                        <AppText
                            variant="bodySmall"
                            tone="error"
                            accessibilityLiveRegion="polite"
                        >
                            {t('settings.development.failed')}
                        </AppText>
                    )}
                </View>
            </SettingsSubSection>
        </SettingsSection>
    );
};
