import { spawnSync } from 'node:child_process';
import { getProfile } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printSuccess } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';

export async function runRunCommand(
  profileName: string,
  commandArgs: string[],
  json: boolean
): Promise<number> {
  try {
    const profile = getProfile(profileName);
    if (!profile) {
      throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
    }

    if (commandArgs.length === 0) {
      throw new ProfileError(
        'No command specified. Usage: gpx run <profile> -- <command>',
        ExitCode.INVALID_INPUT
      );
    }

    const env: Record<string, string | undefined> = { ...process.env };

    env['GIT_AUTHOR_NAME'] = profile.display_name;
    env['GIT_AUTHOR_EMAIL'] = profile.email;
    env['GIT_COMMITTER_NAME'] = profile.display_name;
    env['GIT_COMMITTER_EMAIL'] = profile.email;

    if (profile.ssh_key) {
      env['GIT_SSH_COMMAND'] = `ssh -i "${profile.ssh_key}" -o IdentitiesOnly=yes`;
    }

    if (profile.gpg_key) {
      env['GIT_COMMITTER_SIGNINGKEY'] = profile.gpg_key;
    }

    const command = commandArgs[0] as string;
    const args = commandArgs.slice(1);

    const result = spawnSync(command, args, {
      stdio: 'inherit',
      env: env,
    });

    const exitCode = result.status ?? 1;

    if (json) {
      printJson({
        success: exitCode === 0,
        data: {
          profile: profile.name,
          command: commandArgs.join(' '),
          exit_code: exitCode,
        },
      });
    } else {
      if (exitCode === 0) {
        printSuccess(`Command executed as ${profile.name}`);
      }
    }

    return exitCode;
  } catch (error) {
    return handleCommandError(error);
  }
}
