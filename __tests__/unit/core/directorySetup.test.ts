import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { ensureGpxDir } from '../../../src/core/profileManagement/directorySetup';
import { GPX_DIR } from '../../../src/lib/constants';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  }
}));

describe('directorySetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create the directory if it does not exist', () => {

    vi.mocked(fs.existsSync).mockReturnValue(false);

    ensureGpxDir();

    expect(fs.existsSync).toHaveBeenCalledWith(GPX_DIR);
    expect(fs.mkdirSync).toHaveBeenCalledWith(GPX_DIR, { recursive: true });
  });

  it('should do nothing if the directory already exists', () => {

    vi.mocked(fs.existsSync).mockReturnValue(true);

    ensureGpxDir();

    expect(fs.existsSync).toHaveBeenCalledWith(GPX_DIR);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
});
