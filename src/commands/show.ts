import { getProfile } from '../core/profileManagement/profiles';
import { loadActive } from '../core/profileManagement/activeStore';
import { ExitCode } from '../lib/constants';
import { ProfileError } from '../core/profileManagement/errorClass';
import { handleCommandError, printHuman, printJson, fmt } from '../utils/output';
import { hasPatForProfile } from '../core/credentialManagement/credentialStore';
import { PLATFORM } from '../lib/constants';

export const runShowCommand = async (profileName: string, json: boolean): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    if (!profile) {
      throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
    }

    const active = loadActive().global;

    // For PAT profiles, check if PAT is stored in keychain
    let patConfigured: boolean | null = null;
    if (profile.auth_method === 'pat' && PLATFORM !== 'win32') {
      patConfigured = await hasPatForProfile(profileName);
    }

    const payload = {
      profile,
      active: active === profile.name,
      pat_configured: patConfigured,
    };

    if (json) {
      printJson({ success: true, data: payload });
      return ExitCode.SUCCESS;
    }

    const humanOutputData = [
      `Profile: ${profile.name}`,
      `Display name: ${profile.display_name}`,
      `Email: ${profile.email}`,
      `Authentication method: ${profile.auth_method}`,
    ];

    if (profile.auth_method === 'ssh') {
      humanOutputData.push(`SSH key: ${profile.ssh_key ?? 'not set'}`);
    }

    if (profile.auth_method === 'pat') {
      humanOutputData.push(`GitHub login: ${profile.github_login ?? 'not set'}`);
      if (PLATFORM === 'win32') {
        humanOutputData.push(`PAT: not supported on Windows`);
      } else {
        humanOutputData.push(
          `PAT: ${patConfigured ? fmt.green('configured ✓') : fmt.red('not configured ✗')}`
        );
      }
    }

    humanOutputData.push(
      `GPG key: ${profile.gpg_key ?? 'not set'}`,
      `Signing commits: ${profile.signing_commits ? 'enabled' : 'disabled'}`,
      `Created at: ${profile.created_at}`,
      `Last used at: ${profile.last_used_at ?? 'never'}`,
      `Active: ${active === profile.name ? 'yes' : 'no'}`
    );

    humanOutputData.forEach(printHuman);

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
