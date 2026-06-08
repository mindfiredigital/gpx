import { beforeEach, describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { checkPatAuth } from '../../../src/utils/doctorCommandChecks/checkPatAuth';
import { hasPatForProfile } from '../../../src/core/credentialManagement/credentialStore';
import type { Profile } from '../../../src/lib/types/Profile.type';
import { GPX_CREDENTIAL_HELPER } from '../../../src/lib/constants';

let mockPlatform = 'darwin';

vi.mock('../../../src/lib/constants', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    get PLATFORM() {
      return mockPlatform;
    },
  };
});

vi.mock('../../../src/core/credentialManagement/credentialStore', () => ({
  hasPatForProfile: vi.fn(),
}));

vi.mock('node:child_process', () => ({
  spawnSync: vi.fn(),
}));

describe('checkPatAuth', () => {
  const mockProfile: Profile = {
    name: 'pat-profile',
    display_name: 'PAT User',
    email: 'ansuman@gmail.com',
    auth_method: 'pat',
    created_at: '2026-05-28',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlatform = 'darwin';
  });

  it('should return fail result on Windows', async () => {
    mockPlatform = 'win32';
    const results = await checkPatAuth(mockProfile);

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      label: 'PAT auth [pat-profile]',
      status: 'fail',
      message: 'PAT authentication is not supported on Windows',
    });
  });

  it('should pass PAT stored check if PAT is present in keychain', async () => {
    vi.mocked(hasPatForProfile).mockResolvedValue(true);
    vi.mocked(spawnSync).mockReturnValue({
      stdout: Buffer.from(`${GPX_CREDENTIAL_HELPER}\n`),
    } as any);

    const results = await checkPatAuth(mockProfile);

    expect(hasPatForProfile).toHaveBeenCalledWith('pat-profile');
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      label: 'PAT stored [pat-profile]',
      status: 'pass',
      message: 'PAT found in OS keychain',
    });
    expect(results[1]).toEqual({
      label: 'Git credential helper [pat-profile]',
      status: 'pass',
      message: `credential.https://github.com.helper = "${GPX_CREDENTIAL_HELPER}"`,
    });
  });


  it('should fail PAT stored check and warn about credential helper if not registered', async () => {
    vi.mocked(hasPatForProfile).mockResolvedValue(false);
    vi.mocked(spawnSync).mockReturnValue({
      stdout: Buffer.from('some-other-helper\n'),
    } as any);

    const results = await checkPatAuth(mockProfile);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      label: 'PAT stored [pat-profile]',
      status: 'fail',
      message: 'No PAT found. Run: gpx pat set pat-profile',
    });
    expect(results[1]).toEqual({
      label: 'Git credential helper [pat-profile]',
      status: 'warn',
      message: 'gpx credential helper not registered for GitHub. Run: gpx use pat-profile',
    });
  });

  it('should handle git command failures gracefully and mark helper as warn', async () => {
    vi.mocked(hasPatForProfile).mockResolvedValue(true);
    vi.mocked(spawnSync).mockImplementation(() => {
      throw new Error('git failed');
    });

    const results = await checkPatAuth(mockProfile);

    expect(results).toHaveLength(2);
    expect(results[1].status).toBe('warn');
  });
});
