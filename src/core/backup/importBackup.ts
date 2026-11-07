import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import { BackupError } from './backupErrors';
import { ARC_BACKUP_EXTENSION, type BackupFileV1 } from './backupTypes';
import { parseBackupJson } from './backupValidation';

export const importBackupFromFile = async (): Promise<BackupFileV1 | null> => {
    let result: DocumentPicker.DocumentPickerResult;
    try {
        result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });
    } catch {
        throw new BackupError('READ_FAILED');
    }
    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset.name.toLowerCase().endsWith(ARC_BACKUP_EXTENSION)) {
        throw new BackupError('INVALID_EXTENSION');
    }
    let contents: string;
    try {
        contents = await new File(asset.uri).text();
    } catch {
        throw new BackupError('READ_FAILED');
    }
    return parseBackupJson(contents);
};
