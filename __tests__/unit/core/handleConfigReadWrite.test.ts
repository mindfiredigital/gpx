import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import {
  readSshConfig,
  writeSshConfig,
  buildSshBlock,
} from '../../../src/core/sshConfigManagement/handleConfigReadWrite';
import { ensureSshExists, ensureSshConfigExists } from '../../../src/core/sshConfigManagement/sshconfig';
import { backupFile } from '../../../src/core/profileManagement/storeBackup';
import { withLock } from '../../../src/core/profileManagement/fileLocking';
import { atomicWrite } from '../../../src/core/profileManagement/atomicWrite';
import type { Profile } from '../../../src/lib/types/Profile.type';

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

vi.mock('../../../src/core/sshConfigManagement/sshconfig', () => ({
  ensureSshExists: vi.fn(),
  ensureSshConfigExists: vi.fn(),
}));

vi.mock('../../../src/core/profileManagement/storeBackup', () => ({
  backupFile: vi.fn(),
}));

vi.mock('../../../src/core/profileManagement/fileLocking', () => ({
  withLock: vi.fn((cb) => cb()),
}));

vi.mock('../../../src/core/profileManagement/atomicWrite', () => ({
  atomicWrite: vi.fn(),
}));

describe('handleConfigReadWrite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readSshConfig', () => {
    it('should ensure directories exist and read file contents', () => {
      vi.mocked(fs.readFileSync).mockReturnValue('Host github.com\n');

      const content = readSshConfig();

      expect(ensureSshExists).toHaveBeenCalled();
      expect(ensureSshConfigExists).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String), { encoding: 'utf-8' });
      expect(content).toBe('Host github.com\n');
    });
  });

  describe('writeSshConfig', () => {
    it('should write under file lock with backup', async () => {
      const mockContent = 'New SSH Config';

      await writeSshConfig(mockContent);

      expect(ensureSshExists).toHaveBeenCalled();
      expect(ensureSshConfigExists).toHaveBeenCalled();
      expect(withLock).toHaveBeenCalled();
      expect(backupFile).toHaveBeenCalledWith(expect.any(String), 'ssh-backup');
      expect(atomicWrite).toHaveBeenCalledWith(expect.any(String), mockContent);
    });
  });

  describe('buildSshBlock', () => {
    it('should build correct SSH configuration block', () => {
      const mockProfile: Profile = {
        name: 'test-profile',
        display_name: 'Test',
        email: 'ansuman@gmail.com',
        auth_method: 'ssh',
        ssh_key: '/users/home/.ssh/id_test',
        created_at: '2026-05-28',
      };

      const block = buildSshBlock(mockProfile);

      expect(block).toContain('# BEGIN gpx:test-profile');
      expect(block).toContain('Host github.com-test-profile');
      expect(block).toContain('Hostname github.com');
      expect(block).toContain('User git');
      expect(block).toContain('IdentityFile "/users/home/.ssh/id_test"');
      expect(block).toContain('IdentitiesOnly yes');
      expect(block).toContain('# END gpx:test-profile');
    });

    it('should use empty string if ssh_key is undefined', () => {
      const mockProfile: Profile = {
        name: 'test-profile',
        display_name: 'Test',
        email: 'ansuman@gmail.com',
        auth_method: 'ssh',
        created_at: '2026-05-28',
      };

      const block = buildSshBlock(mockProfile);

      expect(block).toContain('IdentityFile ""');
    });
  });
});
