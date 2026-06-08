import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runEditCommand } from '../../../src/commands/edit';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    loadActive: vi.fn(),
    applyProfileToGitConfig: vi.fn(),
    upsertSshConfigForProfile: vi.fn(),
    existsSync: vi.fn(),
  },
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
  getProfile: mocks.getProfile,
  updateProfile: mocks.updateProfile,
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
  loadActive: mocks.loadActive,
}));

vi.mock('../../../src/core/gitconfig', () => ({
  applyProfileToGitConfig: mocks.applyProfileToGitConfig,
}));

vi.mock('../../../src/core/sshConfigManagement/sshconfig', () => ({
  upsertSshConfigForProfile: mocks.upsertSshConfigForProfile,
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: mocks.existsSync,
  },
}));

const sshProfile = {
  name: 'work',
  display_name: 'Work User',
  email: 'work@example.com',
  auth_method: 'ssh' as const,
  ssh_key: '/Users/user/.ssh/id_ed25519',
  created_at: '2026-05-28T12:00:00.000Z',
};

const patProfile = {
  name: 'personal',
  display_name: 'Personal User',
  email: 'personal@example.com',
  auth_method: 'pat' as const,
  github_username: 'github-user',
  created_at: '2026-05-28T12:00:00.000Z',
};

let consoleOutput: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];

  setOutputFlags({ json: false, quiet: false, color: true });

  mocks.loadActive.mockReturnValue({ global: null, local: {} });
  mocks.updateProfile.mockResolvedValue(undefined);
  mocks.applyProfileToGitConfig.mockReturnValue(undefined);
  mocks.upsertSshConfigForProfile.mockResolvedValue(undefined);
  mocks.existsSync.mockReturnValue(true);

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('edit command', () => {
  describe('profile not found', () => {
    it('should return PROFILE_NOT_FOUND if profile does not exist', async () => {
      mocks.getProfile.mockReturnValue(null);

      const status = await runEditCommand('nonexistent', { displayName: 'New Name' }, false);

      expect(status).toBe(ExitCode.PROFILE_NOT_FOUND);
      expect(mocks.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('no options provided', () => {
    it('should return INVALID_INPUT if no edit flags are provided', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);

      const status = await runEditCommand('work', {}, false);

      expect(status).toBe(ExitCode.INVALID_INPUT);
      expect(mocks.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('PAT profile validation', () => {
    it('should reject sshKey on a PAT profile', async () => {
      mocks.getProfile.mockReturnValue(patProfile);

      const status = await runEditCommand(
        'personal',
        { sshKey: '/Users/user/.ssh/id_ed25519' },
        false
      );

      expect(status).toBe(ExitCode.INVALID_INPUT);
      expect(mocks.updateProfile).not.toHaveBeenCalled();
      const output = consoleOutput.join('\n');
      expect(output).toMatch(/SSH key cannot be set on a PAT profile/i);
    });

    it('should allow updating email on a PAT profile', async () => {
      mocks.getProfile.mockReturnValue(patProfile);

      const status = await runEditCommand('personal', { email: 'new@example.com' }, false);

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        'personal',
        expect.objectContaining({ email: 'new@example.com' })
      );
    });

    it('should allow updating github_username on a PAT profile', async () => {
      mocks.getProfile.mockReturnValue(patProfile);

      const status = await runEditCommand(
        'personal',
        { githubUsername: 'new-github-user' },
        false
      );

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        'personal',
        expect.objectContaining({ github_username: 'new-github-user' })
      );
    });

    it('should allow updating displayName on a PAT profile', async () => {
      mocks.getProfile.mockReturnValue(patProfile);

      const status = await runEditCommand('personal', { displayName: 'New Display' }, false);

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        'personal',
        expect.objectContaining({ display_name: 'New Display' })
      );
    });
  });

  describe('SSH profile validation', () => {
    it('should reject githubUsername on an SSH profile', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);

      const status = await runEditCommand(
        'work',
        { githubUsername: 'some-user' },
        false
      );

      expect(status).toBe(ExitCode.INVALID_INPUT);
      expect(mocks.updateProfile).not.toHaveBeenCalled();
      const output = consoleOutput.join('\n');
      expect(output).toMatch(/GitHub username cannot be set on an SSH profile/i);
    });

    it('should allow updating sshKey on an SSH profile', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);
      mocks.existsSync.mockReturnValue(true);

      const status = await runEditCommand(
        'work',
        { sshKey: '/Users/user/.ssh/id_rsa' },
        false
      );

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        'work',
        expect.objectContaining({ ssh_key: '/Users/user/.ssh/id_rsa' })
      );
    });

    it('should return INVALID_INPUT if sshKey path does not exist', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);
      mocks.existsSync.mockReturnValue(false);

      const status = await runEditCommand(
        'work',
        { sshKey: '/invalid/path/key' },
        false
      );

      expect(status).toBe(ExitCode.INVALID_INPUT);
      expect(mocks.updateProfile).not.toHaveBeenCalled();
    });

    it('should allow updating email on an SSH profile', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);

      const status = await runEditCommand('work', { email: 'new@work.com' }, false);

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        'work',
        expect.objectContaining({ email: 'new@work.com' })
      );
    });

    it('should allow updating displayName on an SSH profile', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);

      const status = await runEditCommand('work', { displayName: 'New Work Name' }, false);

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        'work',
        expect.objectContaining({ display_name: 'New Work Name' })
      );
    });
  });

  describe('active profile git config sync', () => {
    it('should apply git config if profile is globally active', async () => {
      mocks.getProfile
        .mockReturnValueOnce(sshProfile) // initial getProfile call
        .mockReturnValueOnce({ ...sshProfile, email: 'updated@work.com' }); // post-update getProfile
      mocks.loadActive.mockReturnValue({ global: 'work', local: {} });

      const status = await runEditCommand('work', { email: 'updated@work.com' }, false);

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.applyProfileToGitConfig).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'work' }),
        'global'
      );
    });

    it('should NOT apply git config if profile is not globally active', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);
      mocks.loadActive.mockReturnValue({ global: 'other-profile', local: {} });

      const status = await runEditCommand('work', { email: 'updated@work.com' }, false);

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.applyProfileToGitConfig).not.toHaveBeenCalled();
    });

    it('should update ssh config when sshKey changes on an active profile', async () => {
      const updatedProfile = { ...sshProfile, ssh_key: '/Users/user/.ssh/id_rsa' };
      mocks.getProfile
        .mockReturnValueOnce(sshProfile)
        .mockReturnValueOnce(updatedProfile);
      mocks.loadActive.mockReturnValue({ global: 'work', local: {} });
      mocks.existsSync.mockReturnValue(true);

      const status = await runEditCommand(
        'work',
        { sshKey: '/Users/user/.ssh/id_rsa' },
        false
      );

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.upsertSshConfigForProfile).toHaveBeenCalledWith(updatedProfile);
    });
  });

  describe('JSON output', () => {
    it('should print JSON result when --json flag is used', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);
      setOutputFlags({ json: true, quiet: false, color: false });

      const status = await runEditCommand('work', { displayName: 'New Name' }, true);

      expect(status).toBe(ExitCode.SUCCESS);
      const result = JSON.parse(consoleOutput[0] as string);
      expect(result).toMatchObject({
        success: true,
        data: {
          profile: 'work',
          changes: { display_name: 'New Name' },
        },
      });
    });
  });

  describe('signing_commits update', () => {
    it('should update signing_commits flag on an SSH profile', async () => {
      mocks.getProfile.mockReturnValue(sshProfile);

      const status = await runEditCommand('work', { signing: true }, false);

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        'work',
        expect.objectContaining({ signing_commits: true })
      );
    });

    it('should disable signing_commits flag', async () => {
      mocks.getProfile.mockReturnValue({ ...sshProfile, signing_commits: true });

      const status = await runEditCommand('work', { signing: false }, false);

      expect(status).toBe(ExitCode.SUCCESS);
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        'work',
        expect.objectContaining({ signing_commits: false })
      );
    });
  });
});
