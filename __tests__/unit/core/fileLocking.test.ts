import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { withLock } from '../../../src/core/profileManagement/fileLocking';
import { ExitCode } from '../../../src/lib/constants';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    ensureGpxDir: vi.fn(),
  }
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  }
}));

vi.mock('../../../src/core/profileManagement/directorySetup', () => ({
  ensureGpxDir: mocks.ensureGpxDir,
}));

describe('withLock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a lock, run the function, and clean up', async () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const writeOperation = vi.fn().mockResolvedValue('data');

    const result = await withLock(writeOperation);

    expect(result).toBe('data');
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalled();
  });


  it('should throw ProfileError if a lock file already exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const writeOperation = vi.fn();

    await expect(withLock(writeOperation)).rejects.toThrow(
      new ProfileError('another process is running', ExitCode.PERMISSION_ERROR)
    );

    expect(writeOperation).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('should ensure lock is removed if the operation fails', async () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const writeOperation = vi.fn().mockRejectedValue(new Error('operation failed'));

    await expect(withLock(writeOperation)).rejects.toThrow('operation failed');
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

});
