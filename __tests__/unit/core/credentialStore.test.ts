import { beforeEach, describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import {
  storePatForProfile,
  getPatForProfile,
  deletePatForProfile,
  hasPatForProfile,
} from '../../../src/core/credentialManagement/credentialStore';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import * as constants from '../../../src/lib/constants';
import fs from 'node:fs';

vi.mock('../../../src/lib/constants', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    PLATFORM: 'darwind'
  };
});

vi.mock('node:child_process', () => ({
  spawnSync: vi.fn(),
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  }
}));

describe('credentialStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (constants as any).PLATFORM = 'darwin';
  });

  describe('Windows platform operations', () => {
    beforeEach(() => {
      (constants as any).PLATFORM = 'win32';
      vi.mocked(fs.existsSync).mockReturnValue(false);
    });

    it('should successfully store PAT on Windows', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      await storePatForProfile('work', 'ghp_win_token');
      expect(fs.mkdirSync).toHaveBeenCalledWith(constants.CREDENTIALS_DIR, { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('work.json'), JSON.stringify({ pat: 'ghp_win_token' }), { encoding: 'utf-8' });
    });

    it('should return PAT if found on Windows', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ pat: 'ghp_retrieved_win' }));
      const token = await getPatForProfile('work');
      expect(token).toBe('ghp_retrieved_win');
    });

    it('should return null if file invalid on Windows', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error(); });
      const token = await getPatForProfile('work');
      expect(token).toBeNull();
    });

    it('should return null if file does not exist on Windows', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const token = await getPatForProfile('work');
      expect(token).toBeNull();
    });

    it('should delete PAT on Windows', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      await deletePatForProfile('work');
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('work.json'));
    });
  });

  describe('Darwin (macOS) keychain operations', () => {
    beforeEach(() => {
      (constants as any).PLATFORM = 'darwin';
    });

    it('should successfully store PAT on macOS', async () => {
      vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: Buffer.from('') } as any);

      await storePatForProfile('work', 'ghp_mac_token');

      expect(spawnSync).toHaveBeenCalledTimes(2);
      expect(spawnSync).toHaveBeenNthCalledWith(1, 'security', [
        'delete-generic-password',
        '-s',
        'gpx',
        '-a',
        'work',
      ]);
      expect(spawnSync).toHaveBeenNthCalledWith(2, 'security', [
        'add-generic-password',
        '-l',
        'gpx:work',
        '-s',
        'gpx',
        '-a',
        'work',
        '-w',
        'ghp_mac_token',
      ]);
    });

    it('should throw ProfileError if storing fails on macOS', async () => {
      vi.mocked(spawnSync).mockReturnValueOnce({ status: 1 } as any);
      vi.mocked(spawnSync).mockReturnValueOnce({
        status: 1,
        stderr: Buffer.from('some error occured'),
      } as any);

      await expect(storePatForProfile('work', 'ghp_mac_token')).rejects.toThrow(ProfileError);
    });

    it('should return PAT if found in macOS keychain', async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 0,
        stdout: Buffer.from('ghp_retrieved_mac\n'),
      } as any);

      const token = await getPatForProfile('work');
      expect(token).toBe('ghp_retrieved_mac');
      expect(spawnSync).toHaveBeenCalledWith('security', [
        'find-generic-password',
        '-s',
        'gpx',
        '-a',
        'work',
        '-w',
      ]);
    });

    it('should return null if not found in macOS keychain', async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 1,
        stdout: Buffer.from(''),
      } as any);

      const token = await getPatForProfile('work');
      expect(token).toBeNull();
    });

    it('should delete PAT on macOS keychain', async () => {
      vi.mocked(spawnSync).mockReturnValue({ status: 0 } as any);
      await deletePatForProfile('work');
      expect(spawnSync).toHaveBeenCalledWith('security', [
        'delete-generic-password',
        '-s',
        'gpx',
        '-a',
        'work',
      ]);
    });
  });

  describe('Linux secret-tool operations', () => {
    beforeEach(() => {
      (constants as any).PLATFORM = 'linux';
    });

    it('should successfully store PAT on Linux', async () => {
      vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: Buffer.from('') } as any);

      await storePatForProfile('work', 'ghp_linux_token');

      expect(spawnSync).toHaveBeenCalledWith(
        'secret-tool',
        ['store', '--label', 'gpx:work', 'service', 'gpx', 'profile', 'work'],
        { input: 'ghp_linux_token' }
      );
    });

    it('should throw secret-tool missing warning if ENOENT occurs', async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: -1,
        error: new Error('spawn secret-tool ENOENT'),
      } as any);

      await expect(storePatForProfile('work', 'ghp_linux_token')).rejects.toThrow(
        'secret-tool not found. Install it with: sudo apt install libsecret-tools'
      );
    });

    it('should throw standard ProfileError for generic store failure on Linux', async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 1,
        stderr: Buffer.from('some error occured'),
      } as any);

      await expect(storePatForProfile('work', 'ghp_linux_token')).rejects.toThrow(
        'Failed to store PAT: some error occured'
      );
    });

    it('should return PAT if found on Linux', async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 0,
        stdout: Buffer.from('ghp_retrieved_linux\n'),
      } as any);

      const token = await getPatForProfile('work');
      expect(token).toBe('ghp_retrieved_linux');
      expect(spawnSync).toHaveBeenCalledWith('secret-tool', [
        'lookup',
        'service',
        'gpx',
        'profile',
        'work',
      ]);
    });

    it('should return null if lookup fails on Linux', async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 1,
        stdout: Buffer.from(''),
      } as any);

      const token = await getPatForProfile('work');
      expect(token).toBeNull();
    });

    it('should delete PAT on Linux', async () => {
      vi.mocked(spawnSync).mockReturnValue({ status: 0 } as any);
      await deletePatForProfile('work');
      expect(spawnSync).toHaveBeenCalledWith('secret-tool', [
        'clear',
        'service',
        'gpx',
        'profile',
        'work',
      ]);
    });
  });

  describe('Unsupported platforms', () => {
    beforeEach(() => {
      (constants as any).PLATFORM = 'freebsd';
    });

    it('should throw ProfileError for unsupported platforms', async () => {
      await expect(storePatForProfile('work', 'ghp_token')).rejects.toThrow(
        'Unsupported platform: freebsd'
      );
      await expect(getPatForProfile('work')).rejects.toThrow(
        'Unsupported platform: freebsd'
      );
    });
  });

  describe('hasPatForProfile', () => {
    beforeEach(() => {
      (constants as any).PLATFORM = 'darwin';
    });

    it('should return true if token is found', async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 0,
        stdout: Buffer.from('ghp_present_token\n'),
      } as any);

      const hasPat = await hasPatForProfile('work');
      expect(hasPat).toBe(true);
    });

    it('should return false if token is empty or null', async () => {
      vi.mocked(spawnSync).mockReturnValue({
        status: 1,
        stdout: Buffer.from(''),
      } as any);

      const hasPat = await hasPatForProfile('work');
      expect(hasPat).toBe(false);
    });
  });
});
