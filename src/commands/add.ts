import { addProfile, validateProfileName } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { ask } from '../utils/prompt';
import { handleCommandError, printHuman, printJson, printSuccess } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';
import type { AddArgs } from '../lib/types/AddCommand.type';
import { generateSshKeyForProfile } from '../core/sshConfigManagement/generateSshKey';
import { upsertSshConfigForProfile } from '../core/sshConfigManagement/sshconfig';
import { validatePat } from '../core/githubManagement/validatePat';
import { storePatForProfile } from '../core/credentialManagement/credentialStore';
import { ensureCredentialHelperAdded } from '../core/credentialManagement/ensureHelper';

const runSshAddCommand = async (args: AddArgs): Promise<number> => {
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

    // SSH key setup - only prompt if no flag was passed and we are in interactive mode
    if (!args.generateSsh && !sshKeyPath) {
      if (args.noInteractive) {
        throw new ProfileError(
          'Either --generate-ssh or --ssh-key <path> is required in --no-interactive mode',
          ExitCode.INVALID_INPUT
        );
      }

      const { select } = await import('@inquirer/prompts');
      const { listExistingSshKeys } = await import('../core/sshConfigManagement/listSshKeys');

      const setupChoice = await select({
        message: 'SSH Key setup:',
        choices: [
          { name: 'Generate new SSH key', value: 'generate' },
          { name: 'Use an existing SSH key from ~/.ssh', value: 'existing' },
        ],
        theme: { style: { keysHelpTip: () => undefined } },
      });

      if (setupChoice === 'generate') {
        args.generateSsh = true;
      } else {
        // List private keys in ~/.ssh that have a matching .pub file
        const existingKeys = listExistingSshKeys();

        if (existingKeys.length === 0) {
          throw new ProfileError(
            'No existing SSH keys found.\n' + 'use: --generate-ssh or choose: Generate new SSH key',
            ExitCode.SSH_KEY_MISSING
          );
        }

        const pickedPath = await select({
          message: 'Select an SSH key:',
          choices: existingKeys.map((k) => ({
            name: k.name,
            value: k.privateKeyPath,
          })),
          theme: { style: { keysHelpTip: () => undefined } },
        });

        sshKeyPath = pickedPath;
      }
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
      auth_method: args.authMethod,
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

const runPatAddCommand = async (args: AddArgs): Promise<number> => {
  try {
    // Validate profile name
    const nameValidation = validateProfileName(args.name);
    if (!nameValidation.valid) {
      throw new ProfileError(
        nameValidation.reason ?? 'Invalid profile name',
        ExitCode.INVALID_INPUT
      );
    }

    if (!args.pat) {
      throw new ProfileError('PAT is required for PAT-based profiles.', ExitCode.INVALID_INPUT);
    }

    printHuman('Validating PAT with GitHub...');
    let identity: { login: string };
    try {
      identity = await validatePat(args.pat);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PAT validation failed';
      throw new ProfileError(message, ExitCode.INVALID_INPUT);
    }

    let displayName = args.displayName || identity.login;
    let email = args.email;

    if (!email) {
      if (args.noInteractive) {
        throw new ProfileError(
          '--email is required in --no-interactive mode',
          ExitCode.INVALID_INPUT
        );
      }
      email = await ask(`Email: `);
    }

    if (!email) {
      throw new ProfileError('Email is required', ExitCode.INVALID_INPUT);
    }

    if (!args.noInteractive) {
      const confirm = await ask(
        `Found GitHub username: ${identity.login}\nUse this identity? [y/n]: `
      );
      if (confirm.toLowerCase() === 'n') {
        printHuman('Aborted.');
        return ExitCode.SUCCESS;
      }
    }

    const profileToAdd = {
      name: args.name,
      display_name: displayName,
      email: email,
      auth_method: 'pat' as const,
      github_username: identity.login,
      gpg_key: args.gpgKey || undefined,
      signing_commits: args.signing ?? false,
      created_at: new Date().toISOString(),
    };

    await addProfile(profileToAdd);

    await storePatForProfile(args.name, args.pat);

    ensureCredentialHelperAdded();

    args.pat = '';

    const payload = {
      profile: {
        name: profileToAdd.name,
        display_name: profileToAdd.display_name,
        email: profileToAdd.email,
        github_username: profileToAdd.github_username,
        auth_method: profileToAdd.auth_method,
      },
    };

    if (args.json) {
      printJson({ success: true, data: payload });
    } else {
      printSuccess(`Profile added: ${args.name} (PAT / HTTPS)`);
      printHuman(`\nTo start using this profile:`);
      printHuman(`  gpx use ${args.name}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};

export { runSshAddCommand, runPatAddCommand };
