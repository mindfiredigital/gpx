import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { loadActive, saveActive } from '../../../src/core/profileManagement/activeStore';
import { ensureGpxDir } from '../../../src/core/profileManagement/directorySetup';
import { atomicWrite } from '../../../src/core/profileManagement/atomicWrite';
import { withLock } from '../../../src/core/profileManagement/fileLocking';
import { backupFile } from '../../../src/core/profileManagement/storeBackup';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

vi.mock('../../../src/core/profileManagement/directorySetup', () => ({
  ensureGpxDir: vi.fn(),
}));

vi.mock('../../../src/core/profileManagement/atomicWrite', () => ({
  atomicWrite: vi.fn(),
}));

vi.mock('../../../src/core/profileManagement/fileLocking', () => ({
  withLock: vi.fn((cb) => cb()),
}));

vi.mock('../../../src/core/profileManagement/storeBackup', () => ({
  backupFile: vi.fn(),
}));

describe('activeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadActive', () => {
    it('should call ensureGpxDir', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      loadActive();
      expect(ensureGpxDir).toHaveBeenCalled();
    });

    it('should return empty active store if active.json does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const result = loadActive();
      expect(result).toEqual({ global: null, switched_at: null });
    });

    it('should parse and return store if active.json exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('{"global":"work-profile","switched_at":"2026-05-28T12:12:12Z"}');
      
      const result = loadActive();
      expect(result).toEqual({
        global: 'work-profile',
        switched_at: '2026-05-28T12:12:12Z',
      });
      expect(fs.readFileSync).toHaveBeenCalled();
    });
  });

  describe('saveActive', () => {
    it('should ensure dir', async () => {
      const mockStore = { global: 'new-profile', switched_at: '2026-05-28' };
      
      await saveActive(mockStore);

      expect(ensureGpxDir).toHaveBeenCalled();
      expect(withLock).toHaveBeenCalled();
      expect(backupFile).toHaveBeenCalledWith(expect.any(String), 'backup');
      expect(atomicWrite).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(mockStore, null, 2)
      );
    });
  });
});
