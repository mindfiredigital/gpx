import { addProfile, validateProfileName } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { ask } from '../utils/prompt';
import { handleCommandError, printJson, printSuccess } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';
import type { AddArgs } from '../lib/types/AddCommand.type';

export const runAddCommand = async (args: AddArgs): Promise<number> => {
  try {
    const nameValidation = validateProfileName(args.name);
    if (!nameValidation.valid) {
      throw new ProfileError(
        nameValidation.reason ?? 'Invalid profile name',
        ExitCode.INVALID_INPUT
      );
    }

    let displayName = args.displayName;
    let email = args.email;

    if (!displayName || !email) {
      if (args.noInteractive) {
        throw new ProfileError(
          'Both --display-name and --email are required in --no-interactive mode',
          ExitCode.INVALID_INPUT
        );
      }

      if (!displayName) {
        displayName = await ask('Display name: ');
      }
      if (!email) {
        email = await ask('Email: ');
      }
    }

    if (!displayName || !email) {
      throw new ProfileError('Both display name and email are required', ExitCode.INVALID_INPUT);
    }

    await addProfile({
      name: args.name,
      display_name: displayName,
      email,
      ssh_key: args.sshKey || undefined,
      gpg_key: args.gpgKey || undefined,
      signing_commits: args.signing ?? false,
      created_at: new Date().toISOString(),
    });

    const payload = {
      profile: {
        name: args.name,
        display_name: displayName,
        email,
      },
    };

    if (args.json) {
      printJson({ success: true, data: payload });
    } else {
      printSuccess(`Profile added: ${args.name}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
