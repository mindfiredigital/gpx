import { beforeEach, describe, expect, it, vi } from 'vitest';
import { detectProfileFromRepo } from '../../../src/core/autodetect';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    isInsideGitRepo: vi.fn(),
    getRemoteUrl: vi.fn(),
    getGpxProfileFromRemote: vi.fn(),
    getProfile: vi.fn(),
    loadActive: vi.fn(),
  },
}));

vi.mock('../../../src/core/gitconfig', () => ({
  isInsideGitRepo: mocks.isInsideGitRepo,
  getRemoteUrl: mocks.getRemoteUrl,
  getGpxProfileFromRemote: mocks.getGpxProfileFromRemote,
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
  getProfile: mocks.getProfile,
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
  loadActive: mocks.loadActive,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('detectProfileFromRepo', () => {
  it('should return reason when not inside a git repo', () => {
    mocks.isInsideGitRepo.mockReturnValue(false);

    const result = detectProfileFromRepo();

    expect(result.detectedProfile).toBeNull();
    expect(result.needsSwitch).toBe(false);
    expect(result.reason).toBe('not inside a git repository');
  });

  it('should return reason when no remote "origin" exists', () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.getRemoteUrl.mockReturnValue(null);

    const result = detectProfileFromRepo();

    expect(result.detectedProfile).toBeNull();
    expect(result.needsSwitch).toBe(false);
    expect(result.reason).toBe('no remote "origin" found');
  });

  it('should return reason when remote URL has no gpx host alias', () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.getRemoteUrl.mockReturnValue('https://github.com/ansumain/repo.git');
    mocks.getGpxProfileFromRemote.mockReturnValue(null);

    const result = detectProfileFromRepo();

    expect(result.detectedProfile).toBeNull();
    expect(result.needsSwitch).toBe(false);
    expect(result.reason).toBe('remote URL does not use a gpx host alias');
  });

  it('should return reason when profile from remote does not exist in gpx', () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.getRemoteUrl.mockReturnValue('git@github.com-deleted:org/repo.git');
    mocks.getGpxProfileFromRemote.mockReturnValue('deleted');
    mocks.getProfile.mockReturnValue(undefined);

    const result = detectProfileFromRepo();

    expect(result.detectedProfile).toBeNull();
    expect(result.needsSwitch).toBe(false);
    expect(result.reason).toContain('not found in gpx');
  });

  it('should detect profile and return needsSwitch=true when active profile is different', () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.getRemoteUrl.mockReturnValue('git@github.com-work:ansumain/gpx-tester.git');
    mocks.getGpxProfileFromRemote.mockReturnValue('work');
    mocks.getProfile.mockReturnValue({
      name: 'work',
      display_name: 'ansumain',
      email: '2004.ansuman@gmail.com',
      created_at: new Date().toISOString(),
    });
    mocks.loadActive.mockReturnValue({ global: 'personal' });

    const result = detectProfileFromRepo();

    expect(result.detectedProfile).not.toBeNull();
    expect(result.detectedProfile?.name).toBe('work');
    expect(result.currentProfileName).toBe('personal');
    expect(result.needsSwitch).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('should return needsSwitch=false when already on the correct profile', () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.getRemoteUrl.mockReturnValue('git@github.com-work:ansumain/gpx-tester.git');
    mocks.getGpxProfileFromRemote.mockReturnValue('work');
    mocks.getProfile.mockReturnValue({
      name: 'work',
      display_name: 'ansumain',
      email: '2004.ansuman@gmail.com',
      created_at: new Date().toISOString(),
    });
    mocks.loadActive.mockReturnValue({ global: 'work' });

    const result = detectProfileFromRepo();

    expect(result.detectedProfile).not.toBeNull();
    expect(result.needsSwitch).toBe(false);
    expect(result.reason).toBeNull();
  });
});
