import { getProfile } from '../core/profileManagement/profiles';
import { loadActive } from '../core/profileManagement/activeStore';
import { ExitCode } from '../lib/constants';
import { ProfileError } from '../core/profileManagement/errorClass';
import { handleCommandError, printHuman, printJson } from '../utils/output';

export const runShowCommand = async (profileName: string, json: boolean): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    if (!profile) {
      throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
    }

    const active = loadActive().global;
    const payload = {
      profile,
      active: active === profile.name,
    };

    if (json) {
      printJson({ success: true, data: payload });
      return ExitCode.SUCCESS;
    }

    const humanOutputData = [
      `Profile: ${profile.name}`,
      `Display name: ${profile.display_name}`,
      `Email: ${profile.email}`,
      `SSH key: ${profile.ssh_key ?? 'not set'}`,
      `GPG key: ${profile.gpg_key ?? 'not set'}`,
      `Signing commits: ${profile.signing_commits ? 'enabled' : 'disabled'}`,
      `Created at: ${profile.created_at}`,
      `Last used at: ${profile.last_used_at ?? 'never'}`,
      `Active: ${payload.active ? 'yes' : 'no'}`,
    ];
    humanOutputData.forEach(printHuman);

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
