import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { atomicWrite } from '../../../src/core/profileManagement/atomicWrite';

vi.mock('node:fs', () => ({
    default: {
        openSync: vi.fn(),
        writeFileSync: vi.fn(),
        fsyncSync: vi.fn(),
        closeSync: vi.fn(),
        renameSync: vi.fn(),
    },
}));

describe('atomicWrite', () => {
    const filePath = 'config.txt';
    const tempPath = 'config.txt.temp';
    const data = 'imaginary-data';
    const mockFd = 8989;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should follow the atomic write sequence: open temp -> write -> fsync -> close -> rename', () => {
        vi.mocked(fs.openSync).mockReturnValue(mockFd);

        atomicWrite(filePath, data);
        expect(fs.openSync).toHaveBeenCalledWith(tempPath, 'w');
        expect(fs.writeFileSync).toHaveBeenCalledWith(mockFd, data, { encoding: 'utf-8' });
        expect(fs.fsyncSync).toHaveBeenCalledWith(mockFd);
        expect(fs.closeSync).toHaveBeenCalledWith(mockFd);
        expect(fs.renameSync).toHaveBeenCalledWith(tempPath, filePath);
    });

    it('should ensure the file handle is closed even if writing fails', () => {
        vi.mocked(fs.openSync).mockReturnValue(mockFd);
        vi.mocked(fs.writeFileSync).mockImplementation(() => {
            throw new Error('write error');
        });

        expect(() => atomicWrite(filePath, data)).toThrow('write error');
        expect(fs.closeSync).toHaveBeenCalledWith(mockFd);

        expect(fs.renameSync).not.toHaveBeenCalled();
    });
});
