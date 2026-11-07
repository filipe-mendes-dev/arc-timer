import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { Skeleton } from '@src/components/ui/Skeleton/Skeleton';
import { useSessionCardSkeletonStyles } from './SessionCardSkeleton.styles';

export const SessionCardSkeleton = () => {
    const { t } = useTranslation();
    const st = useSessionCardSkeletonStyles();
    return (
        <MetaCard
            expandable={false}
            summaryContent={
                <View
                    style={st.content}
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityLabel={t('statistics.sessions')}
                    accessibilityState={{ busy: true }}
                >
                    <Skeleton style={st.date} />
                    <Skeleton style={st.title} />
                    <View style={st.metrics}>
                        <Skeleton style={st.metric} />
                        <Skeleton style={st.metric} />
                    </View>
                </View>
            }
        />
    );
};
