import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { BackupError } from '@src/core/backup/backupErrors';
import { ARC_BACKUP_MIME } from '@src/core/backup/backupTypes';
import { exportBackupToFile } from '@src/core/backup/exportBackup';
import { importBackupFromFile } from '@src/core/backup/importBackup';

import { createBackupFixture } from '../../../fixtures/backups';

const mockWrite = jest.fn<void, [unknown]>();
const mockText = jest.fn<Promise<string>, []>();
const mockDelete = jest.fn<void, [string]>();
const mockList = jest.fn<unknown[], []>();
const mockModificationTime = jest.fn<number | null, [string]>();

jest.mock('expo-file-system', () => ({
    Paths: { cache: { uri: 'cache', list: () => mockList() } },
    File: class {
        uri: string;
        name: string;
        constructor(...parts: (string | { uri: string })[]) {
            const path = parts.map((part) => (typeof part === 'string' ? part : part.uri));
            this.uri = `file:///${path.join('/')}`;
            this.name = path[path.length - 1];
        }
        get modificationTime() {
            return mockModificationTime(this.name);
        }
        write(contents: unknown) {
            mockWrite(contents);
        }
        text() {
            return mockText();
        }
        delete() {
            mockDelete(this.uri);
        }
    },
}));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

beforeEach(() => {
    jest.resetAllMocks();
    mockList.mockReturnValue([]);
    mockModificationTime.mockReturnValue(Date.now());
    mockText.mockResolvedValue(JSON.stringify(createBackupFixture()));
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    jest.mocked(Sharing.shareAsync).mockResolvedValue(undefined);
    jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
        canceled: false,
        assets: [{ name: 'demo.arcbak', uri: 'file:///demo.arcbak', lastModified: 0 }],
    });
});

describe('importBackupFromFile', () => {
    it('reads and validates a picked .arcbak file', async () => {
        await expect(importBackupFromFile()).resolves.toEqual(createBackupFixture());
        expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({
            type: '*/*',
            copyToCacheDirectory: true,
        });
    });

    it('returns no backup when the user cancels the picker', async () => {
        jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
            canceled: true,
            assets: null,
        });
        await expect(importBackupFromFile()).resolves.toBeNull();
        expect(mockText).not.toHaveBeenCalled();
    });

    it('rejects the wrong extension before reading the file', async () => {
        jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
            canceled: false,
            assets: [{ name: 'demo.json', uri: 'file:///demo.json', lastModified: 0 }],
        });
        await expect(importBackupFromFile()).rejects.toEqual(new BackupError('INVALID_EXTENSION'));
        expect(mockText).not.toHaveBeenCalled();
    });

    it('accepts uppercase backup extensions', async () => {
        jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
            canceled: false,
            assets: [{ name: 'DEMO.ARCBAK', uri: 'file:///DEMO.ARCBAK', lastModified: 0 }],
        });
        await expect(importBackupFromFile()).resolves.toEqual(createBackupFixture());
    });

    it('reports unreadable files', async () => {
        mockText.mockRejectedValue(new Error('File unavailable'));
        await expect(importBackupFromFile()).rejects.toEqual(new BackupError('READ_FAILED'));
    });

    it('reports file picker failures', async () => {
        jest.mocked(DocumentPicker.getDocumentAsync).mockRejectedValue(
            new Error('Picker unavailable'),
        );
        await expect(importBackupFromFile()).rejects.toEqual(new BackupError('READ_FAILED'));
    });

    it('rejects malformed file contents', async () => {
        mockText.mockResolvedValue('{');
        await expect(importBackupFromFile()).rejects.toEqual(new BackupError('INVALID_JSON'));
    });
});

describe('exportBackupToFile', () => {
    it('writes only the backup data and opens the native share sheet', async () => {
        const fixture = createBackupFixture();
        await exportBackupToFile(fixture, 'Export backup');
        const written: unknown = mockWrite.mock.calls[0][0];
        expect(typeof written).toBe('string');
        if (typeof written !== 'string') throw new Error('Expected a JSON backup');
        expect(JSON.parse(written)).toEqual(fixture);
        expect(Sharing.shareAsync).toHaveBeenCalledWith(expect.stringMatching(/\.arcbak$/), {
            mimeType: ARC_BACKUP_MIME,
            UTI: 'public.json',
            dialogTitle: 'Export backup',
        });
        expect(mockDelete).not.toHaveBeenCalled();
    });

    it('does not write a file when sharing is unavailable', async () => {
        jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);
        await expect(exportBackupToFile(createBackupFixture(), 'Backup')).rejects.toEqual(
            new BackupError('SHARING_UNAVAILABLE'),
        );
        expect(mockWrite).not.toHaveBeenCalled();
    });

    it('reports failures to create the backup file', async () => {
        mockWrite.mockImplementation(() => {
            throw new Error('Disk full');
        });
        await expect(exportBackupToFile(createBackupFixture(), 'Backup')).rejects.toEqual(
            new BackupError('WRITE_FAILED'),
        );
        expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });

    it('retains the shared file even if the share result reports a failure', async () => {
        jest.mocked(Sharing.shareAsync).mockRejectedValue(new Error('Share failed'));
        await expect(exportBackupToFile(createBackupFixture(), 'Backup')).rejects.toEqual(
            new BackupError('SHARE_FAILED'),
        );
        expect(mockDelete).not.toHaveBeenCalled();
    });

    it('removes only backup exports older than seven days', async () => {
        const expired = new File('arc-timer-backup-expired.arcbak');
        const recent = new File('arc-timer-backup-recent.arcbak');
        const unrelated = new File('unrelated.arcbak');
        const differentExtension = new File('arc-timer-backup-note.txt');
        const unknownAge = new File('arc-timer-backup-unknown.arcbak');
        mockList.mockReturnValue([expired, recent, unrelated, differentExtension, unknownAge, {}]);
        mockModificationTime.mockImplementation((name) => {
            if (name === unknownAge.name) return null;
            if (name === recent.name) return Date.now();
            return Date.now() - 8 * 24 * 60 * 60 * 1000;
        });

        await exportBackupToFile(createBackupFixture(), 'Backup');

        expect(mockDelete).toHaveBeenCalledTimes(1);
        expect(mockDelete).toHaveBeenCalledWith(expired.uri);
    });

    it('still shares the new export when deleting an expired backup fails', async () => {
        mockList.mockReturnValue([new File('arc-timer-backup-expired.arcbak')]);
        mockModificationTime.mockReturnValue(0);
        mockDelete.mockImplementation(() => {
            throw new Error('Cleanup failed');
        });
        await expect(exportBackupToFile(createBackupFixture(), 'Backup')).resolves.toBeUndefined();
        expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    });

    it('still shares the new export when the cache directory cannot be listed', async () => {
        mockList.mockImplementation(() => {
            throw new Error('Cache unavailable');
        });
        await expect(exportBackupToFile(createBackupFixture(), 'Backup')).resolves.toBeUndefined();
        expect(Sharing.shareAsync).toHaveBeenCalledTimes(1);
    });
});
