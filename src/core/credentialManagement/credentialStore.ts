import { spawnSync } from 'node:child_process';
import { PLATFORM, SERVICE } from '../../lib/constants';
import { ExitCode } from '../../lib/constants';
import { ProfileError } from '../profileManagement/errorClass';

const showErrorOnWindows = (): void => {
  if (PLATFORM === 'win32') {
    throw new ProfileError(
      `PAT Authentication is not supported on Windows.`,
      ExitCode.INVALID_INPUT
    );
  }
};

const storePatForProfile = async (profileName: string, pat: string): Promise<void> => {
  try {
    showErrorOnWindows();
    if (PLATFORM === 'darwin') {
      spawnSync(
        'security',
        ['delete-generic-password', '-s', `${SERVICE}`, '-a', `${profileName}`]
      );
      const process = spawnSync(
        'security',
        ['add-generic-password', '-l', `${SERVICE}:${profileName}`, '-s', `${SERVICE}`, '-a', `${profileName}`, '-w', `${pat}`]
      );

      if (process.status !== 0) {
        throw new ProfileError(
          `Failed to store PAT: ${process.stderr?.toString().trim() || 'Unknown Error'}`,
          ExitCode.INVALID_INPUT
        );
      }
      return;
    }

    if (PLATFORM === 'linux') {
      const process = spawnSync(
        'secret-tool',
        ['store', '--label', `${SERVICE}:${profileName}`, 'service', SERVICE, 'profile', profileName],
        { input: pat }
      );
      if (process.status !== 0) {
        if (process.error?.message?.includes('ENOENT')) {
          throw new ProfileError(
            'secret-tool not found. Install it with: sudo apt install libsecret-tools',
            ExitCode.INVALID_INPUT
          );
        }
        throw new ProfileError(
          `Failed to store PAT: ${process.stderr?.toString().trim() || 'Unknown Error'}`,
          ExitCode.INVALID_INPUT
        );
      }
      return;
    }
  } catch (error) {
    if (error instanceof ProfileError) throw error;
    throw new ProfileError(`Unsupported platform: ${PLATFORM}`, ExitCode.INVALID_INPUT);
  }
};

const getPatForProfile = async (profileName: string): Promise<string | null> => {
  showErrorOnWindows();

  try {
    let commandString: { command: string, args: string[] } | undefined;

    if (PLATFORM === 'darwin') {
      commandString = { command: 'security', args: ['find-generic-password', '-s', `${SERVICE}`, '-a', `${profileName}`, '-w'] };
    }

    if (PLATFORM === 'linux') {
      commandString = { command: 'secret-tool', args: ['lookup', 'service', `${SERVICE}`, 'profile', `${profileName}`] };
    }

    if (commandString) {
      const process = spawnSync(commandString.command, commandString.args);
      if (process.status === 0)
        return process.stdout.toString().trim() || null;
      return null;
    }

    throw new ProfileError(`Unsupported platform: ${PLATFORM}`, ExitCode.INVALID_INPUT);

  } catch (error) {
    if (error instanceof ProfileError) throw error;
    return null;
  }
};

const deletePatForProfile = async (profileName: string): Promise<void> => {
  showErrorOnWindows();

  try {
    if (PLATFORM === 'darwin') {
      spawnSync(
        'security',
        ['delete-generic-password', '-s', `${SERVICE}`, '-a', `${profileName}`]
      );
      return;
    }

    if (PLATFORM === 'linux') {
      spawnSync(
        'secret-tool',
        ['clear', 'service', `${SERVICE}`, 'profile', `${profileName}`]
      );
      return;
    }
  } catch {
    // PAT doesn't exist
  }
};

const hasPatForProfile = async (profileName: string): Promise<boolean> => {
  try {
    const pat = await getPatForProfile(profileName);
    return pat !== null && pat.length > 0;
  } catch {
    return false;
  }
};

export { storePatForProfile, getPatForProfile, deletePatForProfile, hasPatForProfile };