import { BackupError } from '@src/core/backup/backupErrors';
import {
    ARC_BACKUP_FORMAT_VERSION,
    ARC_BACKUP_KIND,
    CURRENT_BACKUP_SCHEMA_VERSION,
    type BackupFileV1,
} from '@src/core/backup/backupTypes';
import { validateBackup } from '@src/core/backup/backupValidation';
import type { BackupRepository } from '../../repositories/backups/backupRepositoryFactory';
import type { Clock } from '../../repositories/repositoryClock';

export interface BackupService {
    exportBackup: () => BackupFileV1;
    restoreBackup: (backup: unknown) => void;
}

interface CreateBackupServiceArgs {
    backupRepository: BackupRepository;
    clock: Clock;
}

export const createBackupService = ({
    backupRepository,
    clock,
}: CreateBackupServiceArgs): BackupService => ({
    exportBackup: () =>
        validateBackup({
            kind: ARC_BACKUP_KIND,
            version: ARC_BACKUP_FORMAT_VERSION,
            schemaVersion: CURRENT_BACKUP_SCHEMA_VERSION,
            exportedAt: new Date(clock.now()).toISOString(),
            tables: backupRepository.exportRows(),
        }),
    restoreBackup: (input) => {
        const backup = validateBackup(input);
        if (backupRepository.hasActiveGymSession()) throw new BackupError('ACTIVE_SESSION');
        try {
            backupRepository.replaceRows(backup.tables);
        } catch {
            throw new BackupError('RESTORE_FAILED');
        }
    },
});
