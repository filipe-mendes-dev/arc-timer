import { useMutation, useQueryClient } from '@tanstack/react-query';

import { BackupError } from '@src/core/backup/backupErrors';
import type { BackupFileV1 } from '@src/core/backup/backupTypes';
import { exportBackupToFile } from '@src/core/backup/exportBackup';
import { dbServices } from '@src/db/dbServices';
import { useWorkoutRunStore } from '@src/state/stores/useWorkoutRunStore';
import { useWorkoutDraftStore } from '@src/state/stores/useWorkoutDraftStore';
import { useGymPlanBuilderStore } from '@src/state/stores/useGymPlanBuilderStore';

export const useExportBackupMutation = () =>
    useMutation({
        mutationFn: async (dialogTitle: string) => {
            await exportBackupToFile(dbServices.backupService.exportBackup(), dialogTitle);
        },
    });

export const useRestoreBackupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (backup: BackupFileV1) => {
            await queryClient.cancelQueries();
            if (useWorkoutRunStore.getState().steps.length > 0) {
                throw new BackupError('ACTIVE_SESSION');
            }
            dbServices.backupService.restoreBackup(backup);
            useWorkoutDraftStore.getState().clearDraft();
            useGymPlanBuilderStore.getState().clearDraft();
            useWorkoutRunStore.getState().resetRun();
            queryClient.removeQueries({ type: 'inactive' });
            await queryClient.resetQueries({ type: 'active' });
        },
    });
};
