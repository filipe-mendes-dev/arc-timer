import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dbServices } from '@src/db/dbServices';

export const useSampleDataMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (names: readonly string[] | undefined) => {
            await queryClient.cancelQueries();
            if (names) dbServices.sampleDataService.loadSampleData(names);
            else dbServices.sampleDataService.removeSampleData();
        },
        onSuccess: () => queryClient.invalidateQueries(),
    });
};
