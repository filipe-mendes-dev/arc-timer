import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import type { ReactNode } from 'react';
import { MetricCard } from '@src/components/ui/MetricCard';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { useTheme } from '@src/theme/ThemeProvider';
import { useStatisticsOverviewStyles } from './StatisticsOverview.styles';
import { Skeleton } from '@src/components/ui/Skeleton/Skeleton';
interface StatisticsOverviewProps {
    rightAccessory?: ReactNode;
    isLoading?: boolean;
    metrics: readonly { label: string; value: number | string }[];
}
export const StatisticsOverview = ({
    metrics,
    rightAccessory,
    isLoading = false,
}: StatisticsOverviewProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const st = useStatisticsOverviewStyles();
    const topLeftContent = {
        text: t('statistics.overview'),
        icon: (
            <AppIcon
                id="stats"
                color={theme.palette.metaCard.topLeftContent.text}
            />
        ),
    };
    return (
        <ScreenSection
            title={rightAccessory ? t('statistics.overview') : undefined}
            rightAccessory={rightAccessory}
        >
            <MetaCard
                expandable={false}
                withBottomFade={false}
                topLeftContent={rightAccessory ? undefined : topLeftContent}
                summaryContent={
                    <View style={st.metrics}>
                        {metrics.map((metric) => (
                            <View key={metric.label} style={st.metric}>
                                <MetricCard
                                    label={metric.label}
                                    value={isLoading ? <Skeleton style={st.metricSkeleton} accessibilityLabel={metric.label} /> : metric.value}
                                />
                            </View>
                        ))}
                    </View>
                }
            />
        </ScreenSection>
    );
};
