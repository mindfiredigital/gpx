import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runPatAddCommand } from '../../../src/commands/add';
import * as constants from '../../../src/lib/constants';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    addProfile: vi.fn(),
    validateProfileName: vi.fn(),
    ask: vi.fn(),
    validatePat: vi.fn(),
    storePatForProfile: vi.fn(),
    ensureCredentialHelperAdded: vi.fn(),
  },
}));

vi.mock('../../../src/lib/constants', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../src/lib/constants')>();
  return {
    ...original,
    PLATFORM: 'darwin',
  };
});

vi.mock('../../../src/core/profileManagement/profiles', () => ({
  addProfile: mocks.addProfile,
  validateProfileName: mocks.validateProfileName,
}));

vi.mock('../../../src/utils/prompt', () => ({
  ask: mocks.ask,
}));

vi.mock('../../../src/core/githubManagement/validatePat', () => ({
  validatePat: mocks.validatePat,
}));

vi.mock('../../../src/core/credentialManagement/credentialStore', () => ({
  storePatForProfile: mocks.storePatForProfile,
}));

vi.mock('../../../src/core/credentialManagement/ensureHelper', () => ({
  ensureCredentialHelperAdded: mocks.ensureCredentialHelperAdded,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];

  (constants as any).PLATFORM = 'darwin';

  setOutputFlags({ json: false, quiet: false, color: true });
  mocks.validateProfileName.mockReturnValue({ valid: true });
  mocks.validatePat.mockResolvedValue({ login: 'github-user' });

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('add command - PAT', () => {
  it('should add PAT profile successfully with flags', async () => {
    const status = await runPatAddCommand({
      name: 'pat-profile',
      displayName: 'some name',
      email: 'ansuman@gmail.com',
      pat: 'ghp_token',
      authMethod: 'pat',
      noInteractive: true,
      json: false,
    });

    expect(status).toBe(ExitCode.SUCCESS);
    expect(mocks.validatePat).toHaveBeenCalledWith('ghp_token');
    expect(mocks.storePatForProfile).toHaveBeenCalledWith('pat-profile', 'ghp_token');
    expect(mocks.ensureCredentialHelperAdded).toHaveBeenCalledOnce();
    expect(mocks.addProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'pat-profile',
        display_name: 'some name',
        email: 'ansuman@gmail.com',
        auth_method: 'pat',
        github_username: 'github-user',
      })
    );
  });

  it('should fail in no-interactive mode if email is not provided', async () => {
    const status = await runPatAddCommand({
      name: 'pat-profile',
      pat: 'ghp_token',
      authMethod: 'pat',
      noInteractive: true,
      json: false,
    });

    expect(status).toBe(ExitCode.INVALID_INPUT);
    expect(mocks.addProfile).not.toHaveBeenCalled();
  });

  it('should fail if PAT validation throws an error', async () => {
    mocks.validatePat.mockRejectedValue(new Error('Invalid token'));

    const status = await runPatAddCommand({
      name: 'pat-profile',
      email: 'ansuman@gmail.com',
      pat: 'invalid_token',
      authMethod: 'pat',
      noInteractive: true,
      json: false,
    });

    expect(status).toBe(ExitCode.INVALID_INPUT);
    expect(mocks.addProfile).not.toHaveBeenCalled();
  });
});
