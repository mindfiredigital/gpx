import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runAutoDetectCommand } from '../../../src/commands/autodetect';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    detectProfileFromRepo: vi.fn(),
    applyProfileToGitConfig: vi.fn(),
    updateRemoteForProfile: vi.fn(),
    saveActive: vi.fn(),
  },
}));

vi.mock('../../../src/core/autodetect', () => ({
  detectProfileFromRepo: mocks.detectProfileFromRepo,
}));

vi.mock('../../../src/core/gitconfig', () => ({
  applyProfileToGitConfig: mocks.applyProfileToGitConfig,
  updateRemoteForProfile: mocks.updateRemoteForProfile,
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
  saveActive: mocks.saveActive,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];

  setOutputFlags({ json: false, quiet: false, noColor: true });

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('autodetect command', () => {
  it('should do nothing when no profile is detected', async () => {
    mocks.detectProfileFromRepo.mockReturnValue({
      detectedProfile: null,
      currentProfileName: null,
      needsSwitch: false,
      reason: 'not inside a git repository',
    });

    const code = await runAutoDetectCommand(false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.applyProfileToGitConfig).not.toHaveBeenCalled();
    expect(mocks.saveActive).not.toHaveBeenCalled();
  });

  it('should do nothing when already on the correct profile', async () => {
    mocks.detectProfileFromRepo.mockReturnValue({
      detectedProfile: { name: 'work', display_name: 'ansumain', email: 'a@b.com' },
      currentProfileName: 'work',
      needsSwitch: false,
      reason: null,
    });

    const code = await runAutoDetectCommand(false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.applyProfileToGitConfig).not.toHaveBeenCalled();
    expect(mocks.saveActive).not.toHaveBeenCalled();
  });

  it('should switch profile when repo requires a different profile', async () => {
    mocks.detectProfileFromRepo.mockReturnValue({
      detectedProfile: {
        name: 'work',
        display_name: 'ansumain',
        email: '2004.ansuman@gmail.com',
      },
      currentProfileName: 'personal',
      needsSwitch: true,
      reason: null,
    });

    const code = await runAutoDetectCommand(false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.applyProfileToGitConfig).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'work' }),
      'global'
    );
    expect(mocks.updateRemoteForProfile).toHaveBeenCalledWith('work');
    expect(mocks.saveActive).toHaveBeenCalledWith(
      expect.objectContaining({ global: 'work' })
    );
    expect(consoleOutput.some((msg) => msg.includes('Auto-switched'))).toBe(true);
    expect(consoleOutput.some((msg) => msg.includes('personal'))).toBe(true);
    expect(consoleOutput.some((msg) => msg.includes('work'))).toBe(true);
  });

  it('should return JSON when --json flag is used and switch happens', async () => {
    mocks.detectProfileFromRepo.mockReturnValue({
      detectedProfile: {
        name: 'work',
        display_name: 'ansumain',
        email: '2004.ansuman@gmail.com',
      },
      currentProfileName: 'personal',
      needsSwitch: true,
      reason: null,
    });

    const code = await runAutoDetectCommand(true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: {
        switched: true,
        from_profile: 'personal',
        to_profile: 'work',
      },
    });
  });

  it('should return JSON with switched=false when no switch needed', async () => {
    mocks.detectProfileFromRepo.mockReturnValue({
      detectedProfile: null,
      currentProfileName: null,
      needsSwitch: false,
      reason: 'not inside a git repository',
    });

    const code = await runAutoDetectCommand(true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: {
        switched: false,
        reason: 'not inside a git repository',
      },
    });
  });
});
