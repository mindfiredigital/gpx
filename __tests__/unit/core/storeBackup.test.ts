import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import path from 'node:path';
import { BACKUP_DIR } from '../../../src/lib/constants';
import { backupFile } from '../../../src/core/profileManagement/storeBackup';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        existsSync: vi.fn(),
        mkdirSync: vi.fn(),
        copyFileSync: vi.fn(),
    }
}));

vi.mock('node:fs', () => ({
    default: {
        existsSync: mocks.existsSync,
        mkdirSync: mocks.mkdirSync,
        copyFileSync: mocks.copyFileSync,
    }
}));

describe('backupFile', () => {
    const filePath = 'config';
    const label = 'backup';
    const mockDate = new Date('2026-04-22T13:25:23.123Z');
    const expectedTimestamp = '2026-04-22T13-25-23-123Z';
    const expectedBackupPath = path.join(BACKUP_DIR, `${path.basename(filePath)}.${label}.${expectedTimestamp}`);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(mockDate);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return if the required file does not exist', () => {
        mocks.existsSync.mockReturnValue(false);

        backupFile(filePath, label);

        expect(mocks.mkdirSync).not.toHaveBeenCalled();
        expect(mocks.copyFileSync).not.toHaveBeenCalled();
    });

    it('should create the backup directory if it does not exist', () => {
        mocks.existsSync.mockImplementation((p) => {
            if (p === filePath) return true;
            if (p === BACKUP_DIR) return false;
            return false;
        });

        backupFile(filePath, label);

        expect(mocks.mkdirSync).toHaveBeenCalled();
        expect(mocks.copyFileSync).toHaveBeenCalledWith(filePath, expectedBackupPath);
    });

    it('should not create the backup directory if it already exists', () => {
        mocks.existsSync.mockReturnValue(true);

        backupFile(filePath, label);

        expect(mocks.mkdirSync).not.toHaveBeenCalled();
        expect(mocks.copyFileSync).toHaveBeenCalledWith(filePath, expectedBackupPath);
    });
});
