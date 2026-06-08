import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runCurrentCommand } from '../../../src/commands/current';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    listProfiles: vi.fn(() => [
      {
        name: 'work',
        display_name: 'Ansuman Panda',
        email: 'ansuman@gmail.com',
        created_at: new Date(),
      },
      {
        name: 'personal',
        display_name: 'Ansuman Mindfire',
        email: 'ansuman@mindfire.com',
        created_at: new Date(),
      },
    ]),
    getProfile: vi.fn((name: string) => {
      if (name === 'work') {
        return {
          name: 'work',
          display_name: 'Ansuman Panda',
          email: 'ansuman@gmail.com',
          created_at: new Date(),
        };
      }
      return undefined;
    }),
    loadActive: vi.fn(() => ({ global: 'work', switched_at: new Date() })),
    saveActive: vi.fn(),
    getCurrentGitIdentity: vi.fn((_scope?: string) => ({
      name: 'Ansuman Panda',
      email: 'ansuman@gmail.com',
      signingKey: null,
    })),
    getGpxLocalProfileName: vi.fn((): string | null => null),
    isInsideGitRepo: vi.fn(() => false),
    applyProfileToGitConfig: vi.fn(),
    findProfileNameByIdentity: vi.fn((identity) => {
      if (identity.email === 'ansuman@mindfire.com') return 'personal';
      if (identity.email === 'ansuman@gmail.com') return 'work';
      return null;
    }),
    hasIdentity: vi.fn((identity) => !!identity && !!identity.email)
  },
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
  listProfiles: mocks.listProfiles,
  getProfile: mocks.getProfile,
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
  loadActive: mocks.loadActive,
  saveActive: mocks.saveActive,
}));

vi.mock('../../../src/core/gitconfig', () => ({
  getCurrentGitIdentity: mocks.getCurrentGitIdentity,
  getGpxLocalProfileName: mocks.getGpxLocalProfileName,
  isInsideGitRepo: mocks.isInsideGitRepo,
  applyProfileToGitConfig: mocks.applyProfileToGitConfig,
  findProfileNameByIdentity: mocks.findProfileNameByIdentity,
  hasIdentity: mocks.hasIdentity
}));

let consoleOutput: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];
  setOutputFlags({ json: false, quiet: false, color: true });

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('current command - json', () => {
  it('should return structured json payload', async () => {
    const code = await runCurrentCommand(true);

    expect(code).toBe(ExitCode.SUCCESS);

    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: {
        active: { profile: 'work', scope: 'global' },
        global: {
          profile: 'work',
          name: 'Ansuman Panda',
          email: 'ansuman@gmail.com',
          signingKey: null,
        },
        local: null,
      },
    });
  });

  it('should use repo-local gpx profile as active profile in json mode', async () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.getGpxLocalProfileName.mockReturnValue('personal');
    mocks.getCurrentGitIdentity.mockImplementation((scope?: string) => {
      if (scope === 'local') {
        return {
          name: 'Ansuman Mindfire',
          email: 'ansuman@mindfire.com',
          signingKey: null,
        };
      }

      return {
        name: 'Ansuman Panda',
        email: 'ansuman@gmail.com',
        signingKey: null,
      };
    });

    const code = await runCurrentCommand(true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: {
        active: { profile: 'personal', scope: 'local' },
        global: {
          profile: 'work',
          name: 'Ansuman Panda',
          email: 'ansuman@gmail.com',
          signingKey: null,
        },
        local: {
          profile: 'personal',
          name: 'Ansuman Mindfire',
          email: 'ansuman@mindfire.com',
          signingKey: null,
        },
      },
    });
  });

  it('should infer local profile from identity when repo-local gpx profile is missing', async () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.getGpxLocalProfileName.mockReturnValue(null);
    mocks.getCurrentGitIdentity.mockImplementation((scope?: string) => {
      if (scope === 'local') {
        return {
          name: 'Ansuman Mindfire',
          email: 'ansuman@mindfire.com',
          signingKey: null,
        };
      }

      return {
        name: 'Ansuman Panda',
        email: 'ansuman@gmail.com',
        signingKey: null,
      };
    });

    const code = await runCurrentCommand(true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: {
        active: { profile: 'personal', scope: 'local' },
        local: {
          profile: 'personal',
          name: 'Ansuman Mindfire',
          email: 'ansuman@mindfire.com',
        },
      },
    });
  });
});

describe('current command - human', () => {
  it('should print local identity in human mode when inside repo', async () => {
    mocks.isInsideGitRepo.mockReturnValue(true);
    mocks.getGpxLocalProfileName.mockReturnValue('personal');
    mocks.getCurrentGitIdentity.mockImplementation((scope?: string) => {
      if (scope === 'local')
        return {
          name: 'Ansuman Mindfire',
          email: 'ansuman@mindfire.com',
          signingKey: null,
        };

      return {
        name: 'Ansuman Panda',
        email: 'ansuman@gmail.com',
        signingKey: null,
      };
    });

    const code = await runCurrentCommand(false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(consoleOutput).toContain('Active profile: personal');
    expect(consoleOutput).toContain('Scope: local');
    expect(consoleOutput).toContain('Local profile: personal');
    expect(consoleOutput).toContain('Local name: Ansuman Mindfire');
    expect(consoleOutput).toContain('Local email: ansuman@mindfire.com');
  });
});