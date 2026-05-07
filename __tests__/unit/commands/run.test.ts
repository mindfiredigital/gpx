import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runRunCommand } from '../../../src/commands/run';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    getProfile: vi.fn(),
    spawnSync: vi.fn(),
  },
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
  getProfile: mocks.getProfile,
}));

vi.mock('node:child_process', () => ({
  spawnSync: mocks.spawnSync,
}));

let consoleOutput: string[] = [];

const mockProfile = {
  name: 'work',
  display_name: 'Ada Lovelace',
  email: 'ada@company.com',
  ssh_key: '~/.ssh/id_ed25519_work',
  gpg_key: 'ABC123',
  signing_commits: true,
  created_at: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];

  setOutputFlags({ json: false, quiet: false, noColor: true });

  mocks.getProfile.mockReturnValue(mockProfile);

  mocks.spawnSync.mockReturnValue({ status: 0 });

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('run command', () => {
  it('should run a command with temporary profile env vars', async () => {
    const code = await runRunCommand('work', ['git', 'commit', '-m', 'fix'], false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.spawnSync).toHaveBeenCalledTimes(1);

    const callArgs = mocks.spawnSync.mock.calls[0]!;
    const cmd = callArgs[0];
    const args = callArgs[1];
    const opts = callArgs[2] as any;

    expect(cmd).toBe('git');
    expect(args).toEqual(['commit', '-m', 'fix']);

    expect(opts.env.GIT_AUTHOR_NAME).toBe('Ada Lovelace');
    expect(opts.env.GIT_AUTHOR_EMAIL).toBe('ada@company.com');
    expect(opts.env.GIT_COMMITTER_NAME).toBe('Ada Lovelace');
    expect(opts.env.GIT_COMMITTER_EMAIL).toBe('ada@company.com');
    expect(opts.env.GIT_SSH_COMMAND).toBe('ssh -i "~/.ssh/id_ed25519_work" -o IdentitiesOnly=yes');
    expect(opts.env.GIT_COMMITTER_SIGNINGKEY).toBe('ABC123');
  });

  it('should return profile not found for missing profile', async () => {
    mocks.getProfile.mockReturnValue(undefined);

    const code = await runRunCommand('ghost', ['git', 'status'], false);

    expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
    expect(mocks.spawnSync).not.toHaveBeenCalled();
    expect(consoleOutput.some((msg) => msg.includes('Profile not found: ghost'))).toBe(true);
  });

  it('should error when no command is provided', async () => {
    const code = await runRunCommand('work', [], false);

    expect(code).toBe(ExitCode.INVALID_INPUT);
    expect(mocks.spawnSync).not.toHaveBeenCalled();
    expect(consoleOutput.some((msg) => msg.includes('No command specified'))).toBe(true);
  });

  it('should pass through non-zero exit code from child process', async () => {
    mocks.spawnSync.mockReturnValue({ status: 128 });

    const code = await runRunCommand('work', ['git', 'push'], false);

    expect(code).toBe(128);
  });

  it('should return JSON output when --json flag is used', async () => {
    const code = await runRunCommand('work', ['git', 'status'], true);

    expect(code).toBe(ExitCode.SUCCESS);

    const jsonOutput = JSON.parse(consoleOutput[0] as string);
    expect(jsonOutput).toMatchObject({
      success: true,
      data: {
        profile: 'work',
        command: 'git status',
        exit_code: 0,
      },
    });
  });

  it('should work without SSH key or GPG key', async () => {
    mocks.getProfile.mockReturnValue({
      name: 'personal',
      display_name: 'Alan Turing',
      email: 'alan@gmail.com',
      created_at: new Date().toISOString(),
    });

    const code = await runRunCommand('personal', ['git', 'log'], false);

    expect(code).toBe(ExitCode.SUCCESS);

    const opts = mocks.spawnSync.mock.calls[0]![2] as any;
    expect(opts.env.GIT_AUTHOR_NAME).toBe('Alan Turing');
    expect(opts.env.GIT_AUTHOR_EMAIL).toBe('alan@gmail.com');
    expect(opts.env.GIT_SSH_COMMAND).toBeUndefined();
    expect(opts.env.GIT_COMMITTER_SIGNINGKEY).toBeUndefined();
  });

  it('should return JSON with failure status on non-zero exit', async () => {
    mocks.spawnSync.mockReturnValue({ status: 1 });

    const code = await runRunCommand('work', ['git', 'push'], true);

    expect(code).toBe(1);

    const jsonOutput = JSON.parse(consoleOutput[0] as string);
    expect(jsonOutput).toMatchObject({
      success: false,
      data: {
        exit_code: 1,
      },
    });
  });
});
