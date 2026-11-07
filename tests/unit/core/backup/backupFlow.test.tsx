import { act, createElement, type ReactElement } from 'react';
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BackupError } from '@src/core/backup/backupErrors';
import { exportBackupToFile } from '@src/core/backup/exportBackup';
import { importBackupFromFile } from '@src/core/backup/importBackup';
import { dbServices } from '@src/db/dbServices';
import { isRecord } from '@src/db/mappers/jsonGuards';
import { useSettingsBackup } from '@src/screens/SettingsScreen/useSettingsBackup';
import { useWorkoutRunStore } from '@src/state/stores/useWorkoutRunStore';
import { useWorkoutDraftStore } from '@src/state/stores/useWorkoutDraftStore';
import { useGymPlanBuilderStore } from '@src/state/stores/useGymPlanBuilderStore';
import { useSettingsStore } from '@src/state/useSettingsStore';

import { createBackupFixture } from '../../../fixtures/backups';
import { createWorkoutFixture } from '../../../fixtures/workouts';

jest.mock('@src/db/dbServices', () => ({
    dbServices: { backupService: { exportBackup: jest.fn(), restoreBackup: jest.fn() } },
}));
jest.mock('@src/core/backup/importBackup', () => ({ importBackupFromFile: jest.fn() }));
jest.mock('@src/core/backup/exportBackup', () => ({ exportBackupToFile: jest.fn() }));
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@src/i18n', () => ({
    __esModule: true,
    default: { t: (key: string) => key },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
}));

interface TestRenderer {
    unmount: () => void;
}
interface TestRendererModule {
    create: (element: ReactElement) => TestRenderer;
}
const isRendererModule = (value: unknown): value is TestRendererModule =>
    isRecord(value) && typeof value.create === 'function';
const rendererModule: unknown = jest.requireActual('react-test-renderer');
if (!isRendererModule(rendererModule)) throw new Error('React test renderer is unavailable');
const createRenderer = rendererModule.create;

describe('Settings backup flow', () => {
    let client: QueryClient;
    let renderer: TestRenderer | undefined;
    let result: ReturnType<typeof useSettingsBackup> | undefined;
    const originalConsoleError = console.error;
    const getResult = () => {
        if (!result) throw new Error('Backup hook was not rendered');
        return result;
    };
    const Harness = () => {
        result = useSettingsBackup();
        return null;
    };

    beforeAll(() => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    });
    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation((message: unknown, ...args: unknown[]) => {
            if (
                typeof message === 'string' &&
                message.startsWith('react-test-renderer is deprecated')
            )
                return;
            originalConsoleError(message, ...args);
        });
        useWorkoutRunStore.getState().resetRun();
        useWorkoutDraftStore.getState().clearDraft();
        useGymPlanBuilderStore.getState().clearDraft();
        jest.mocked(dbServices.backupService.restoreBackup).mockReset();
        jest.mocked(dbServices.backupService.exportBackup).mockReturnValue(createBackupFixture());
        jest.mocked(importBackupFromFile).mockResolvedValue(createBackupFixture());
        jest.mocked(exportBackupToFile).mockResolvedValue(undefined);
        client = new QueryClient({
            defaultOptions: {
                mutations: { retry: false, gcTime: Infinity },
                queries: { retry: false, gcTime: Infinity },
            },
        });
        await act(async () => {
            renderer = createRenderer(
                createElement(QueryClientProvider, { client }, createElement(Harness)),
            );
        });
    });
    afterEach(async () => {
        await act(async () => {
            renderer?.unmount();
        });
        client.clear();
        jest.restoreAllMocks();
    });

    it('leaves data untouched when file picking is canceled', async () => {
        jest.mocked(importBackupFromFile).mockResolvedValue(null);
        await act(async () => {
            await getResult().selectBackup();
        });
        expect(getResult().pendingBackup).toBeNull();
        expect(dbServices.backupService.restoreBackup).not.toHaveBeenCalled();
        expect(getResult().status).toBeNull();
    });

    it('requires confirmation after a valid file is selected and supports canceling', async () => {
        await act(async () => {
            await getResult().selectBackup();
        });
        expect(getResult().pendingBackup).not.toBeNull();
        expect(dbServices.backupService.restoreBackup).not.toHaveBeenCalled();
        await act(async () => {
            getResult().cancelRestore();
        });
        expect(getResult().pendingBackup).toBeNull();
        expect(dbServices.backupService.restoreBackup).not.toHaveBeenCalled();
    });

    it('does not offer a destructive confirmation for an invalid file', async () => {
        jest.mocked(importBackupFromFile).mockRejectedValue(new BackupError('INVALID_DATA'));
        await act(async () => {
            await getResult().selectBackup();
        });
        expect(getResult().pendingBackup).toBeNull();
        expect(getResult().status).toBe('settings.backup.errors.invalidData');
        expect(dbServices.backupService.restoreBackup).not.toHaveBeenCalled();
    });

    it('clears transient drafts and refreshes domain queries without changing settings', async () => {
        useWorkoutDraftStore.setState({ draft: createWorkoutFixture() });
        useGymPlanBuilderStore.getState().startNewDraft();
        useSettingsStore.setState({
            themePreference: 'dark',
            accentPreference: 'cyan',
            isSoundEnabled: false,
        });
        const settingsBefore = useSettingsStore.getState();
        jest.mocked(AsyncStorage.setItem).mockClear();
        client.setQueryData(['workouts', 'removed-id'], { id: 'removed-id' });
        const observer = new QueryObserver(client, {
            queryKey: ['probe'],
            queryFn: () => 'restored data',
            initialData: 'previous data',
            staleTime: Infinity,
        });
        const unsubscribe = observer.subscribe(() => {});
        try {
            await act(async () => {
                await getResult().selectBackup();
            });
            await act(async () => {
                await getResult().confirmRestore();
            });
            expect(dbServices.backupService.restoreBackup).toHaveBeenCalledTimes(1);
            expect(useWorkoutDraftStore.getState().draft).toBeNull();
            expect(useGymPlanBuilderStore.getState().draft).toBeNull();
            expect(client.getQueryData(['workouts', 'removed-id'])).toBeUndefined();
            expect(client.getQueryData(['probe'])).toBe('restored data');
            expect(useSettingsStore.getState()).toEqual(settingsBefore);
            expect(AsyncStorage.setItem).not.toHaveBeenCalled();
            expect(getResult().status).toBe('settings.backup.restored');
        } finally {
            unsubscribe();
        }
    });

    it('keeps transient drafts when the database rejects the restore', async () => {
        const draft = createWorkoutFixture();
        useWorkoutDraftStore.setState({ draft });
        jest.mocked(dbServices.backupService.restoreBackup).mockImplementation(() => {
            throw new BackupError('RESTORE_FAILED');
        });
        await act(async () => {
            await getResult().selectBackup();
        });
        await act(async () => {
            await getResult().confirmRestore();
        });
        expect(useWorkoutDraftStore.getState().draft).toEqual(draft);
        expect(getResult().status).toBe('settings.backup.errors.restoreFailed');
    });

    it.each([true, false])(
        'protects a workout run when running is %s, including paused sessions',
        async (running) => {
            useWorkoutRunStore.getState().startRun({
                steps: [
                    {
                        id: 'step',
                        label: 'WORK',
                        durationSec: 30,
                        blockIdx: 0,
                        exIdx: 0,
                        setIdx: 0,
                    },
                ],
                totalSets: 1,
                snapshot: { running },
            });
            await act(async () => {
                await getResult().selectBackup();
            });
            await act(async () => {
                await getResult().confirmRestore();
            });
            expect(dbServices.backupService.restoreBackup).not.toHaveBeenCalled();
            expect(useWorkoutRunStore.getState().steps).toHaveLength(1);
            expect(getResult().status).toBe('settings.backup.errors.activeSession');
        },
    );

    it('does not claim a backup was saved when the native share sheet closes', async () => {
        await act(async () => {
            await getResult().exportBackup();
        });
        expect(exportBackupToFile).toHaveBeenCalledWith(
            createBackupFixture(),
            'settings.backup.shareTitle',
        );
        expect(getResult().status).toBeNull();
        expect(dbServices.backupService.restoreBackup).not.toHaveBeenCalled();
    });

    it('ignores a second export press before the first operation finishes', async () => {
        await act(async () => {
            const first = getResult().exportBackup();
            const second = getResult().exportBackup();
            await Promise.all([first, second]);
        });
        expect(exportBackupToFile).toHaveBeenCalledTimes(1);
    });
});
