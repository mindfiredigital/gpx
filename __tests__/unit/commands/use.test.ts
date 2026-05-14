import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runUseCommand } from '../../../src/commands/use';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    getProfile: vi.fn(),
    saveActive: vi.fn(),
    applyProfileToGitConfig: vi.fn(),
    isInsideGitRepo: vi.fn(),
    updateRemoteForProfile: vi.fn(),
  },
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
  getProfile: mocks.getProfile,
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
  saveActive: mocks.saveActive,
}));

vi.mock('../../../src/core/gitconfig', () => ({
  applyProfileToGitConfig: mocks.applyProfileToGitConfig,
  isInsideGitRepo: mocks.isInsideGitRepo,
  updateRemoteForProfile: mocks.updateRemoteForProfile,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];

  setOutputFlags({ json: false, quiet: false, noColor: true });

  mocks.getProfile.mockReturnValue({
    name: 'work',
    display_name: 'Ansuman Panda',
    email: 'ansuman@mindfire.com',
    created_at: new Date(),
  });

  mocks.isInsideGitRepo.mockReturnValue(false);
  mocks.updateRemoteForProfile.mockReturnValue({ updated: [], httpsWarnings: [] });

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'warn').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('use command', () => {
  it('should switch global profile and keeps active profile', async () => {
    const code = await runUseCommand('work', false, false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.applyProfileToGitConfig).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'work' }),
      'global'
    );
    expect(mocks.saveActive).toHaveBeenCalledWith(expect.objectContaining({ global: 'work' }));
    expect(consoleOutput).toContain('Switched to work (global)');
  });

  it('should switch local profile without writing to global active store', async () => {
    const code = await runUseCommand('work', true, false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.applyProfileToGitConfig).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'work' }),
      'local'
    );
    expect(mocks.saveActive).not.toHaveBeenCalled();
    expect(consoleOutput).toContain('Switched to work (local)');
  });

  it('should return json payload when --json is used', async () => {
    const code = await runUseCommand('work', false, true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: {
        active: {
          name: 'work',
          scope: 'global'
        },
      },
    });
  });

  it('should return "profile not found" when profile does not exist', async () => {
    mocks.getProfile.mockReturnValue(undefined);

    const code = await runUseCommand('missing', false, false);

    expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
    expect(mocks.applyProfileToGitConfig).not.toHaveBeenCalled();
    expect(mocks.saveActive).not.toHaveBeenCalled();
    expect(consoleOutput).toContain('Profile not found: missing');
  });
});

describe('use command - remote URL rewriting', () => {
  it('should warn about HTTPS remotes', async () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.updateRemoteForProfile.mockReturnValue({
      updated: [],
      httpsWarnings: [
        'Remote "origin" uses HTTPS (https://github.com/ansumain/gpx-tester.git). Not Supported.',
      ],
    });

    const code = await runUseCommand('work', false, false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(consoleOutput.some((msg) => msg.includes('HTTPS'))).toBe(true);
  });

  it('should not update remotes when not inside a git repo', async () => {
    mocks.isInsideGitRepo.mockReturnValue(false);

    const code = await runUseCommand('work', false, false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.updateRemoteForProfile).not.toHaveBeenCalled();
  });

  it('should include remote updates in JSON output', async () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.updateRemoteForProfile.mockReturnValue({
      updated: [
        {
          remote: 'origin',
          oldUrl: 'git@github.com-work:org/repo.git',
          newUrl: 'git@github.com-personal:org/repo.git',
        },
      ],
      httpsWarnings: [],
    });

    mocks.getProfile.mockReturnValue({
      name: 'personal',
      display_name: 'ansumain',
      email: '2004.ansuman@gmail.com',
      created_at: new Date(),
    });

    const code = await runUseCommand('personal', false, true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result.data.remotes_updated).toHaveLength(1);
    expect(result.data.remotes_updated[0].newUrl).toContain('github.com-personal');
  });
});
