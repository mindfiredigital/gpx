import { addProfile, validateProfileName } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { ask } from '../utils/prompt';
import { handleCommandError, printHuman, printJson, printSuccess } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';
import type { AddArgs } from '../lib/types/AddCommand.type';
import { generateSshKeyForProfile } from '../core/sshConfigManagement/generateSshKey';
import { upsertSshConfigForProfile } from '../core/sshConfigManagement/sshconfig';

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

    if (args.generateSsh && args.sshKey) {
      throw new ProfileError(
        'use either --generate-ssh or --ssh-key, not both',
        ExitCode.INVALID_INPUT
      );
    }

    let sshKeyPath = args.sshKey || undefined;
    let generateSsh:
      | { privateKeyPath: string; publicKeyPath: string; publicKey: string }
      | undefined;

    // Prompt for name and email
    if (!displayName || !email) {
      if (args.noInteractive) {
        throw new ProfileError(
          'Both --display-name and --email are required in --no-interactive mode',
          ExitCode.INVALID_INPUT
        );
      }
      if (!displayName) displayName = await ask(`Display Name: `);
      if (!email) email = await ask(`Email: `);
    }

    if (!displayName || !email) {
      throw new ProfileError('Both display name and email are required', ExitCode.INVALID_INPUT);
    }

    if (args.generateSsh) {
      generateSsh = generateSshKeyForProfile(args.name, email);
      sshKeyPath = generateSsh.privateKeyPath;
    }

    const profileToAdd = {
      name: args.name,
      display_name: displayName,
      email,
      ssh_key: sshKeyPath,
      gpg_key: args.gpgKey || undefined,
      signing_commits: args.signing ?? false,
      created_at: new Date().toISOString(),
    };

    await addProfile(profileToAdd);

    if (sshKeyPath) await upsertSshConfigForProfile(profileToAdd);

    const payload = {
      profile: {
        name: profileToAdd.name,
        display_name: profileToAdd.display_name,
        email: profileToAdd.email,
        ssh_key: profileToAdd.ssh_key,
      },
      public_key: generateSsh ? generateSsh.publicKey : null,
    };

    if (args.json) {
      printJson({ success: true, data: payload });
    } else {
      printSuccess(`Profile added: ${args.name}`);
      if (generateSsh) {
        printHuman(`\nAdd this public key to your GitHub account:`);
        printHuman(`https://github.com/settings/ssh/new\n`);
        printHuman(generateSsh.publicKey);
      }
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
