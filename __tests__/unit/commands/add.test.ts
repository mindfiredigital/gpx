import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runSshAddCommand } from '../../../src/commands/add';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    addProfile: vi.fn(),
    validateProfileName: vi.fn(),
    ask: vi.fn(),
    select: vi.fn(),
    listExistingSshKeys: vi.fn(),
    upsertSshConfigForProfile: vi.fn(),
    generateSshKeyForProfile: vi.fn(),
  },
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
  addProfile: mocks.addProfile,
  validateProfileName: mocks.validateProfileName,
}));

vi.mock('../../../src/utils/prompt', () => ({
  ask: mocks.ask,
}));

vi.mock('../../../src/core/sshConfigManagement/sshconfig', () => ({
  upsertSshConfigForProfile: mocks.upsertSshConfigForProfile,
}));

vi.mock('@inquirer/prompts', () => ({
  select: mocks.select,
  password: vi.fn(),
}));

vi.mock('../../../src/core/sshConfigManagement/listSshKeys', () => ({
  listExistingSshKeys: mocks.listExistingSshKeys,
}));

vi.mock('../../../src/core/sshConfigManagement/generateSshKey', () => ({
  generateSshKeyForProfile: mocks.generateSshKeyForProfile,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];

  setOutputFlags({ json: false, quiet: false, color: true });
  mocks.validateProfileName.mockReturnValue({ valid: true });
  mocks.addProfile.mockResolvedValue(undefined);
  mocks.upsertSshConfigForProfile.mockResolvedValue(undefined);
  mocks.generateSshKeyForProfile.mockReturnValue({
    privateKeyPath: '/home/user/.ssh/id_ed25519_gpx_work',
    publicKeyPath: '/home/user/.ssh/id_ed25519_gpx_work.pub',
    publicKey: 'ssh-ed25519 AAAA...',
  });

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('add SSH command - non-interactive with flags', () => {
  it('should add profile with --ssh-key path, no prompts shown', async () => {
    const status = await runSshAddCommand({
      name: 'work',
      displayName: 'Ansuman Panda',
      email: 'ansuman@gmail.com',
      sshKey: '/home/user/.ssh/id_ed25519_work',
      authMethod: 'ssh',
      noInteractive: true,
      json: false,
    });

    expect(status).toBe(ExitCode.SUCCESS);
    expect(mocks.addProfile).toHaveBeenCalledOnce();
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it('should error if --no-interactive and no ssh key option given', async () => {
    const status = await runSshAddCommand({
      name: 'work',
      displayName: 'Ansuman Panda',
      email: 'ansuman@gmail.com',
      authMethod: 'ssh',
      noInteractive: true,
      json: false,
    });

    expect(status).toBe(ExitCode.INVALID_INPUT);
    expect(mocks.addProfile).not.toHaveBeenCalled();
  });

  it('should error if --no-interactive and display-name or email missing', async () => {
    const status = await runSshAddCommand({
      name: 'work',
      authMethod: 'ssh',
      noInteractive: true,
      json: false,
    });

    expect(status).toBe(ExitCode.INVALID_INPUT);
  });

  it('should error if both --generate-ssh and --ssh-key are passed together', async () => {
    const status = await runSshAddCommand({
      name: 'work',
      displayName: 'Ansuman Panda',
      email: 'ansuman@gmail.com',
      generateSsh: true,
      sshKey: '/some/path',
      authMethod: 'ssh',
      noInteractive: true,
      json: false,
    });

    expect(status).toBe(ExitCode.INVALID_INPUT);
  });
});

describe('add SSH command - interactive: choose generate', () => {
  it('should prompt for name/email then show key setup select and choose generate', async () => {
    mocks.ask
      .mockResolvedValueOnce('Ansuman Panda')
      .mockResolvedValueOnce('ansuman@gmail.com');


    mocks.select.mockResolvedValueOnce('generate');

    const status = await runSshAddCommand({
      name: 'work',
      authMethod: 'ssh',
      noInteractive: false,
      json: false,
    });

    expect(status).toBe(ExitCode.SUCCESS);
    expect(mocks.select).toHaveBeenCalledTimes(1);
    expect(mocks.select).toHaveBeenCalledWith(expect.objectContaining({
      message: 'SSH Key setup:',
    }));
    expect(mocks.addProfile).toHaveBeenCalledWith(expect.objectContaining({
      name: 'work',
      display_name: 'Ansuman Panda',
      email: 'ansuman@gmail.com',
    }));
  });
});

describe('add SSH command - interactive: choose existing key', () => {
  it('should show key list and use picked key path', async () => {
    mocks.ask
      .mockResolvedValueOnce('Ansuman Panda')
      .mockResolvedValueOnce('ansuman@gmail.com');

    mocks.select.mockResolvedValueOnce('existing');
    mocks.select.mockResolvedValueOnce('/home/user/.ssh/id_ed25519_gpx_work');

    mocks.listExistingSshKeys.mockReturnValue([
      {
        name: 'id_ed25519_gpx_work',
        privateKeyPath: '/home/user/.ssh/id_ed25519_gpx_work',
        publicKeyPath: '/home/user/.ssh/id_ed25519_gpx_work.pub',
      },
    ]);

    const status = await runSshAddCommand({
      name: 'work',
      authMethod: 'ssh',
      noInteractive: false,
      json: false,
    });

    expect(status).toBe(ExitCode.SUCCESS);
    expect(mocks.select).toHaveBeenCalledTimes(2);
    expect(mocks.select).toHaveBeenNthCalledWith(2, expect.objectContaining({
      message: 'Select an SSH key:',
    }));
    expect(mocks.addProfile).toHaveBeenCalledWith(expect.objectContaining({
      ssh_key: '/home/user/.ssh/id_ed25519_gpx_work',
    }));
  });

  it('should error if no existing SSH keys are found', async () => {
    mocks.ask
      .mockResolvedValueOnce('Ansuman Panda')
      .mockResolvedValueOnce('ansuman@gmail.com');

    mocks.select.mockResolvedValueOnce('existing');
    mocks.listExistingSshKeys.mockReturnValue([]);

    const status = await runSshAddCommand({
      name: 'work',
      authMethod: 'ssh',
      noInteractive: false,
      json: false,
    });

    expect(status).toBe(ExitCode.SSH_KEY_MISSING);
    expect(mocks.addProfile).not.toHaveBeenCalled();
  });
});

describe('add SSH command - invalid profile name', () => {
  it('should error if profile name validation fails', async () => {
    mocks.validateProfileName.mockReturnValue({
      valid: false,
      reason: 'Name must be alphanumeric',
    });

    const status = await runSshAddCommand({
      name: 'invalid name!',
      authMethod: 'ssh',
      noInteractive: true,
      json: false,
    });

    expect(status).toBe(ExitCode.INVALID_INPUT);
    expect(mocks.addProfile).not.toHaveBeenCalled();
  });
});

describe('add SSH command - JSON output', () => {
  it('should return valid JSON when --json used with existing key flag', async () => {
    const status = await runSshAddCommand({
      name: 'work',
      displayName: 'Ansuman Panda',
      email: 'ansuman@gmail.com',
      sshKey: '/home/user/.ssh/id_ed25519_work',
      authMethod: 'ssh',
      noInteractive: true,
      json: true,
    });

    expect(status).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: {
        profile: {
          name: 'work',
          display_name: 'Ansuman Panda',
          email: 'ansuman@gmail.com',
          ssh_key: '/home/user/.ssh/id_ed25519_work',
        },
      },
    });
  });
});
