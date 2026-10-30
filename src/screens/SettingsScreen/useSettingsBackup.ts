import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BackupError, type BackupErrorCode } from '@src/core/backup/backupErrors';
import type { BackupFileV1 } from '@src/core/backup/backupTypes';
import { importBackupFromFile } from '@src/core/backup/importBackup';
import {
    useExportBackupMutation,
    useRestoreBackupMutation,
} from '@src/data/backups/backupMutations';
import type { I18nKey } from '@src/i18n/i18nKey';

const errorKeys = {
    INVALID_EXTENSION: 'settings.backup.errors.invalidExtension',
    INVALID_JSON: 'settings.backup.errors.invalidData',
    INVALID_KIND: 'settings.backup.errors.invalidData',
    INVALID_DATA: 'settings.backup.errors.invalidData',
    UNSUPPORTED_FORMAT: 'settings.backup.errors.incompatible',
    UNSUPPORTED_SCHEMA: 'settings.backup.errors.incompatible',
    ACTIVE_SESSION: 'settings.backup.errors.activeSession',
    READ_FAILED: 'settings.backup.errors.readFailed',
    WRITE_FAILED: 'settings.backup.errors.exportFailed',
    SHARING_UNAVAILABLE: 'settings.backup.errors.sharingUnavailable',
    SHARE_FAILED: 'settings.backup.errors.exportFailed',
    RESTORE_FAILED: 'settings.backup.errors.restoreFailed',
} as const satisfies Record<BackupErrorCode, I18nKey>;

export const useSettingsBackup = () => {
    const { t } = useTranslation();
    const exportMutation = useExportBackupMutation();
    const restoreMutation = useRestoreBackupMutation();
    const [pendingBackup, setPendingBackup] = useState<BackupFileV1 | null>(null);
    const [isPicking, setIsPicking] = useState(false);
    const [statusKey, setStatusKey] = useState<I18nKey | null>(null);
    const [hasError, setHasError] = useState(false);
    const isOperationRunning = useRef(false);
    const isBusy = isPicking || exportMutation.isPending || restoreMutation.isPending;

    const showError = (error: unknown, fallback: I18nKey) => {
        setHasError(true);
        setStatusKey(error instanceof BackupError ? errorKeys[error.code] : fallback);
    };

    const exportBackup = async () => {
        if (isOperationRunning.current || pendingBackup) return;
        isOperationRunning.current = true;
        setStatusKey(null);
        try {
            await exportMutation.mutateAsync(t('settings.backup.shareTitle'));
        } catch (error: unknown) {
            showError(error, 'settings.backup.errors.exportFailed');
        } finally {
            isOperationRunning.current = false;
        }
    };

    const selectBackup = async () => {
        if (isOperationRunning.current || pendingBackup) return;
        isOperationRunning.current = true;
        setIsPicking(true);
        setStatusKey(null);
        try {
            setPendingBackup(await importBackupFromFile());
        } catch (error: unknown) {
            showError(error, 'settings.backup.errors.readFailed');
        } finally {
            isOperationRunning.current = false;
            setIsPicking(false);
        }
    };

    const cancelRestore = () => {
        if (isOperationRunning.current) return;
        setPendingBackup(null);
    };

    const confirmRestore = async () => {
        if (isOperationRunning.current || !pendingBackup) return;
        isOperationRunning.current = true;
        const backup = pendingBackup;
        setPendingBackup(null);
        try {
            await restoreMutation.mutateAsync(backup);
            setHasError(false);
            setStatusKey('settings.backup.restored');
        } catch (error: unknown) {
            showError(error, 'settings.backup.errors.restoreFailed');
        } finally {
            isOperationRunning.current = false;
        }
    };

    return {
        cancelRestore,
        confirmRestore,
        exportBackup,
        selectBackup,
        hasError,
        isBusy,
        isPicking,
        pendingBackup,
        isExporting: exportMutation.isPending,
        isRestoring: restoreMutation.isPending,
        status: statusKey === null ? null : t(statusKey),
    };
};
