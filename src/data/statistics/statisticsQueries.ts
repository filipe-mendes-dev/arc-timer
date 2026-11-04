import { useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import type { StatisticsRange } from '@src/core/statistics/gymStatistics';
import { dbServices } from '@src/db/dbServices';
import { gymSessionKeys } from '../gymSessions/gymSessionKeys';

const getGymStatisticsQueryOptions = (
    range: StatisticsRange,
    exerciseDefinitionId?: string,
) =>
    queryOptions({
        queryKey: [
            ...gymSessionKeys.all,
            'statistics',
            range,
            exerciseDefinitionId,
        ],
        queryFn: () =>
            dbServices.gymStatisticsService.getStatistics(
                range,
                exerciseDefinitionId,
            ),
    });

export const useGymStatistics = (
    range: StatisticsRange,
    exerciseDefinitionId?: string,
    isEnabled = true,
) =>
    useQuery({
        ...getGymStatisticsQueryOptions(range, exerciseDefinitionId),
        enabled: isEnabled,
    });

export const useGymAttendanceStatistics = (month: number) => {
    const queryClient = useQueryClient();
    const range = useMemo(() => {
        const date = new Date(month);
        return {
            startedAtMs: month,
            endedBeforeMs: new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                1,
            ).getTime(),
        };
    }, [month]);
    const query = useGymStatistics(range);

    useFocusEffect(
        useCallback(() => {
            if (!query.isSuccess || query.isFetching) return;
            const idleHandle = requestIdleCallback(async () => {
                const date = new Date(month);
                const previousMonth = new Date(
                    date.getFullYear(),
                    date.getMonth() - 1,
                    1,
                ).getTime();
                await queryClient.prefetchQuery(
                    getGymStatisticsQueryOptions({
                        startedAtMs: previousMonth,
                        endedBeforeMs: month,
                    }),
                );
            });
            return () => cancelIdleCallback(idleHandle);
        }, [month, query.isSuccess, query.isFetching, queryClient]),
    );

    return query;
};
