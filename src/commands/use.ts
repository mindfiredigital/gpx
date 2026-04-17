import { getProfile } from '../core/profileManagement/profiles';
import { saveActive } from '../core/profileManagement/activeStore';
import { applyProfileToGitConfig } from '../core/gitconfig';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printSuccess } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';

export const runUseCommand = async (
  profileName: string,
  local: boolean,
  json: boolean
): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    if (!profile) {
      throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
    }

    applyProfileToGitConfig(profile, local ? 'local' : 'global');

    if (!local) {
      await saveActive({
        global: profile.name,
        switched_at: new Date().toISOString(),
      });
    }

    const payload = {
      active: {
        name: profile.name,
        display_name: profile.display_name,
        email: profile.email,
        scope: local ? 'local' : 'global',
      },
    };

    if (json) {
      printJson({ success: true, data: payload });
    } else {
      printSuccess(`Switched to ${profile.name}${local ? ' (local)' : ' (global)'}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
