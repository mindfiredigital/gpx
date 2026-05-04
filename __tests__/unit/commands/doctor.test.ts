import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runDoctorCommand } from '../../../src/commands/doctor';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    getProfile: vi.fn(),
    listProfiles: vi.fn(),
    checkGitInstalled: vi.fn(),
    checkGitIdentity: vi.fn(),
    checkSshAgent: vi.fn(),
    checkSshKey: vi.fn(),
    checkGpgKey: vi.fn(),
    checkRepoRemoteMatch: vi.fn(),
  }
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
  getProfile: mocks.getProfile,
  listProfiles: mocks.listProfiles,
}));

vi.mock('../../../src/utils/doctorCommandChecks/checkGitInstalled', () => ({
  checkGitInstalled: mocks.checkGitInstalled,
}));

vi.mock('../../../src/utils/doctorCommandChecks/checkGitIdentity', () => ({
  checkGitIdentity: mocks.checkGitIdentity,
}));

vi.mock('../../../src/utils/doctorCommandChecks/checkSshAgent', () => ({
  checkSshAgent: mocks.checkSshAgent,
}));

vi.mock('../../../src/utils/doctorCommandChecks/checkSshKey', () => ({
  checkSshKey: mocks.checkSshKey,
}));

vi.mock('../../../src/utils/doctorCommandChecks/checkGpgKey', () => ({
  checkGpgKey: mocks.checkGpgKey,
}));

vi.mock('../../../src/utils/doctorCommandChecks/checkRepoRemoteMatch', () => ({
  checkRepoRemoteMatch: mocks.checkRepoRemoteMatch,
}));

const workProfile = {
  name: 'work',
  display_name: 'ansumain',
  email: '2004.ansuman@gmail.com',
  ssh_key: '~/.ssh/id_ed25519_gpx_work',
  created_at: new Date().toISOString(),
};

let consoleOutput: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];

  setOutputFlags({ json: false, quiet: false, noColor: true });

  mocks.checkGitInstalled.mockReturnValue({
    label: 'Git installed',
    status: 'pass',
    message: 'git version 2.52.0'
  });
  mocks.checkGitIdentity.mockReturnValue({
    label: 'Git identity configured',
    status: 'pass',
    message: 'ansumain <2004.ansuman@gmail.com>'
  });
  mocks.checkSshAgent.mockReturnValue({
    label: 'SSH agent',
    status: 'pass',
    message: '1 key loaded'
  });
  mocks.checkSshKey.mockReturnValue({
    label: 'SSH key (work)',
    status: 'pass',
    message: 'key exists (permissions OK)'
  });
  mocks.checkGpgKey.mockReturnValue({
    label: 'GPG key (work)',
    status: 'pass',
    message: 'No GPG key configured (not required)'
  });
  mocks.checkRepoRemoteMatch.mockReturnValue({
    label: 'Repo remote match',
    status: 'pass',
    message: 'Remote matches profile'
  });

  mocks.listProfiles.mockReturnValue([workProfile]);
  mocks.getProfile.mockReturnValue(workProfile);

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'warn').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('runDoctorCommand', () => {

  it('should run all checks for all profiles when no name given', async () => {
    const code = await runDoctorCommand(undefined, false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.checkGitInstalled).toHaveBeenCalledOnce();
    expect(mocks.checkGitIdentity).toHaveBeenCalledOnce();
    expect(mocks.checkSshAgent).toHaveBeenCalledOnce();
    expect(mocks.checkSshKey).toHaveBeenCalledWith(workProfile);
    expect(mocks.checkGpgKey).toHaveBeenCalledWith(workProfile);
    expect(mocks.checkRepoRemoteMatch).not.toHaveBeenCalled();
  });

  it('should run checks for a specific profile', async () => {
    const code = await runDoctorCommand('work', false);

    expect(code).toBe(ExitCode.SUCCESS);
    expect(mocks.getProfile).toHaveBeenCalledWith('work');
    expect(mocks.checkSshKey).toHaveBeenCalledWith(workProfile);
    expect(mocks.checkGpgKey).toHaveBeenCalledWith(workProfile);
    expect(mocks.checkRepoRemoteMatch).toHaveBeenCalledWith(workProfile);
  });

  it('should return PROFILE_NOT_FOUND for unknown profile', async () => {
    mocks.getProfile.mockReturnValue(undefined);

    const code = await runDoctorCommand('ghost', false);

    expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
  });

  it('should report SSH key missing as fail', async () => {
    mocks.checkSshKey.mockReturnValue({
      label: 'SSH key (work)',
      status: 'fail',
      message: 'SSH key not found'
    });

    await runDoctorCommand('work', true);

    const result = JSON.parse(consoleOutput[0] as string);
    const sshCheck = result.data.checks.find((c: any) => c.label.includes('SSH key'));
    expect(sshCheck.status).toBe('fail');
  });

  it('should report SSH key bad permissions as warn', async () => {
    mocks.checkSshKey.mockReturnValue({
      label: 'SSH key (work)',
      status: 'warn',
      message: 'permissions not 600'
    });

    await runDoctorCommand('work', true);

    const result = JSON.parse(consoleOutput[0] as string);
    const sshCheck = result.data.checks.find((c: any) => c.label.includes('SSH key'));
    expect(sshCheck.status).toBe('warn');
  });

  it('should return exit code 1 when any check fails', async () => {
    mocks.checkGitInstalled.mockReturnValue({
      label: 'Git installed',
      status: 'fail',
      message: 'git not installed'
    });

    const code = await runDoctorCommand(undefined, false);

    expect(code).toBe(1);
  });

  it('should return JSON with checks and summary', async () => {
    const code = await runDoctorCommand('work', true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result.success).toBe(true);
    expect(result.data.checks).toBeInstanceOf(Array);
    expect(result.data.summary).toMatchObject({
      pass: expect.any(Number),
      warn: expect.any(Number),
      fail: expect.any(Number),
    });
  });

  it('should return success false in JSON when checks fail', async () => {
    mocks.checkSshKey.mockReturnValue({
      label: 'SSH key (work)',
      status: 'fail',
      message: 'SSH key not found'
    });

    await runDoctorCommand('work', true);

    const result = JSON.parse(consoleOutput[0] as string);
    expect(result.success).toBe(false);
  });

  it('should report repo remote match as pass when remote matches', async () => {
    mocks.checkRepoRemoteMatch.mockReturnValue({
      label: 'Repo remote match',
      status: 'pass',
      message: 'Remote matches profile work'
    });

    await runDoctorCommand('work', true);

    const result = JSON.parse(consoleOutput[0] as string);
    const remoteCheck = result.data.checks.find((c: any) => c.label.includes('Repo remote'));
    expect(remoteCheck.status).toBe('pass');
  });

  it('should count pass, warn, fail correctly in summary', async () => {
    mocks.checkSshAgent.mockReturnValue({
      label: 'SSH agent',
      status: 'warn',
      message: 'SSH agent not running'
    });
    mocks.checkSshKey.mockReturnValue({
      label: 'SSH key (work)',
      status: 'fail',
      message: 'SSH key not found'
    });

    await runDoctorCommand('work', true);

    const result = JSON.parse(consoleOutput[0] as string);
    expect(result.data.summary.warn).toBeGreaterThanOrEqual(1);
    expect(result.data.summary.fail).toBeGreaterThanOrEqual(1);
  });
});