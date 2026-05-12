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

    printHuman(`Profile: ${profile.name}`);
    printHuman(`Display name: ${profile.display_name}`);
    printHuman(`Email: ${profile.email}`);
    printHuman(`SSH key: ${profile.ssh_key ?? 'not set'}`);
    printHuman(`GPG key: ${profile.gpg_key ?? 'not set'}`);
    printHuman(`Signing commits: ${profile.signing_commits ? 'enabled' : 'disabled'}`);
    printHuman(`Created at: ${profile.created_at}`);
    printHuman(`Last used at: ${profile.last_used_at ?? 'never'}`);
    printHuman(`Active: ${active === profile.name ? 'yes' : 'no'}`);

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
