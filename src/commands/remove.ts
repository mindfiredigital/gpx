import { getProfile, removeProfile } from '../core/profileManagement/profiles';
import { loadActive, saveActive } from '../core/profileManagement/activeStore';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printSuccess } from '../utils/output';
import { removeSshConfigForProfile } from '../core/sshConfigManagement/sshconfig';
import { moveSshKeysToRemoved } from '../utils/moveSshOnRemove';
import {
  clearGitIdentity,
  clearLocalProfileMarker,
  getGpxLocalProfileName,
  isInsideGitRepo,
} from '../core/gitconfig';

export const runRemoveCommand = async (
  profileName: string,
  force: boolean,
  json: boolean
): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    const active = loadActive();
    const isGloballyActive = active.global === profileName;

    let inRepo = false;
    let localProfileName: string | null = null;
    try {
      inRepo = isInsideGitRepo();
      if (inRepo) localProfileName = getGpxLocalProfileName();
    } catch {
      inRepo = false;
    }

    await removeProfile(profileName, force);
    await removeSshConfigForProfile(profileName, profile?.ssh_key);

    if (profile?.ssh_key) moveSshKeysToRemoved(profile.ssh_key);

    if (isGloballyActive) {
      clearGitIdentity('global');
      await saveActive({ global: null, switched_at: null });
    }

    if (inRepo && localProfileName === profileName) {
      clearGitIdentity('local');
      clearLocalProfileMarker();
    }

    if (json) {
      printJson({
        success: true,
        data: {
          removed: profileName,
        },
      });
    } else {
      printSuccess(`Removed profile: ${profileName}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
