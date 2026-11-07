import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dbServices } from '@src/db/dbServices';
import type { LoadSampleDataInput } from '@src/db/services/development/sampleDataServiceFactory';

export const useSampleDataMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: LoadSampleDataInput | undefined) => {
            await queryClient.cancelQueries();
            if (input) dbServices.sampleDataService.loadSampleData(input);
            else dbServices.sampleDataService.removeSampleData();
        },
        onSuccess: () => queryClient.invalidateQueries(),
    });
};
