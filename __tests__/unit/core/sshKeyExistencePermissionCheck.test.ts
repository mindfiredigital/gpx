import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import {
    sshKeyExists,
    sshKeyPermissionsOk,
    validateSshKeyForProfile
} from '../../../src/core/sshConfigManagement/sshKeyExistencePermissionCheck';

vi.mock('node:fs', () => ({
    default: {
        existsSync: vi.fn(),
        statSync: vi.fn(),
    }
}));

describe('SSH Key Existence and Permission Check', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('sshKeyExists', () => {
        it('should return true if file exists', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            expect(sshKeyExists('key-path')).toBe(true);
        });

        it('should return false if file does not exist', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            expect(sshKeyExists('invalid-key-path')).toBe(false);
        });
    });

    describe('sshKeyPermissionsOk', () => {
        const keyPath = 'key-path';

        it('should always return true on Windows', () => {
            Object.defineProperty(process, 'platform', { value: 'win32' });
            expect(sshKeyPermissionsOk(keyPath)).toBe(true);
        });

        it('should return true on Unix when mode is 0o600', () => {
            Object.defineProperty(process, 'platform', { value: 'linux' });
            vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100600 } as fs.Stats);

            expect(sshKeyPermissionsOk(keyPath)).toBe(true);
        });

        it('should return false on Unix when mode is not 0o600 (e.g., 0o644)', () => {
            Object.defineProperty(process, 'platform', { value: 'linux' });
            vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100644 } as fs.Stats);

            expect(sshKeyPermissionsOk(keyPath)).toBe(false);
        });

        it('should return false if fs.statSync throws an error', () => {
            Object.defineProperty(process, 'platform', { value: 'linux' });
            vi.mocked(fs.statSync).mockImplementation(() => { throw new Error('some error'); });

            expect(sshKeyPermissionsOk(keyPath)).toBe(false);
        });
    });

    describe('validateSshKeyForProfile', () => {
        it('should return false if profile has no ssh_key defined', () => {
            const result = validateSshKeyForProfile({ name: 'work' } as any);
            expect(result).toEqual({ exists: false, permissionOk: false });
        });

        it('should return exists: false and permission: false if file missing', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const result = validateSshKeyForProfile({ name: 'work', ssh_key: 'ssh_key' } as any);
            expect(result).toEqual({ exists: false, permissionOk: false });
        });

        it('should return exists: true and permission: true if file exists and has required permissions', () => {
            Object.defineProperty(process, 'platform', { value: 'linux' });
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.statSync).mockReturnValue({ mode: 0o100600 } as fs.Stats);

            const result = validateSshKeyForProfile({ name: 'work', ssh_key: 'ssh_key' } as any);
            expect(result).toEqual({ exists: true, permissionOk: true });
        });
    });
});
