import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { BackupError } from './backupErrors';
import { ARC_BACKUP_EXTENSION, ARC_BACKUP_MIME, type BackupFileV1 } from './backupTypes';

const BACKUP_FILE_PREFIX = 'arc-timer-backup-';
const BACKUP_CACHE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const removeExpiredBackups = (): void => {
    try {
        const expiresBefore = Date.now() - BACKUP_CACHE_RETENTION_MS;
        for (const entry of Paths.cache.list()) {
            if (!(entry instanceof File)) continue;
            if (!entry.name.startsWith(BACKUP_FILE_PREFIX)) continue;
            if (!entry.name.endsWith(ARC_BACKUP_EXTENSION)) continue;
            const modifiedAt = entry.modificationTime;
            if (modifiedAt !== null && modifiedAt < expiresBefore) entry.delete();
        }
    } catch {
        // Cache cleanup must not prevent a new export.
    }
};

export const exportBackupToFile = async (
    backup: BackupFileV1,
    dialogTitle: string,
): Promise<void> => {
    let isSharingAvailable: boolean;
    try {
        isSharingAvailable = await Sharing.isAvailableAsync();
    } catch {
        throw new BackupError('SHARING_UNAVAILABLE');
    }
    if (!isSharingAvailable) throw new BackupError('SHARING_UNAVAILABLE');

    removeExpiredBackups();
    const timestamp = backup.exportedAt.replace(/[:.]/g, '-');
    const file = new File(Paths.cache, `${BACKUP_FILE_PREFIX}${timestamp}${ARC_BACKUP_EXTENSION}`);
    try {
        file.write(JSON.stringify(backup));
    } catch {
        throw new BackupError('WRITE_FAILED');
    }

    try {
        await Sharing.shareAsync(file.uri, {
            mimeType: ARC_BACKUP_MIME,
            UTI: 'public.json',
            dialogTitle,
        });
    } catch {
        throw new BackupError('SHARE_FAILED');
    }
};
