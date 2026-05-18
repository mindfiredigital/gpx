import { getProfile } from '../core/profileManagement/profiles';
import { saveActive } from '../core/profileManagement/activeStore';
import {
  applyProfileToGitConfig,
  getGpxProfileFromRemote,
  getRemoteUrl,
  isInsideGitRepo,
  updateRemoteForProfile,
} from '../core/gitconfig';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printSuccess, printWarn } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';
import { upsertSshConfigForProfile } from '../core/sshConfigManagement/sshconfig';
import { validateSshKeyForProfile } from '../core/sshConfigManagement/sshKeyExistencePermissionCheck';
import type { RemoteUpdate } from '../lib/types/RemoteUpdate.type';

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

    const scope = local ? 'local' : 'global';
    const warnings: string[] = [];

    if (local && isInsideGitRepo()) {
      const remoteUrl = getRemoteUrl('origin');
      if (remoteUrl) {
        const repoProfile = getGpxProfileFromRemote(remoteUrl);
        if (repoProfile && repoProfile !== profileName) {
          warnings.push(`⚠︎ You are switching to "${profileName}", locally
         ⚠︎ Commits would be using "${profileName}"s initials
         ⚠︎ You would not be able to push if "${profileName}" doesn't have write access to the remote`);
        }
      }
    }
    applyProfileToGitConfig(profile, scope);

    if (profile.ssh_key) {
      const sshValidation = validateSshKeyForProfile(profile);
      if (!sshValidation.exists) {
        warnings.push(
          `SSH key not found: ${profile.ssh_key}.\nGit identity switched successfully.\nFix: run gpx doctor ${profile.name} to diagnose SSH issues.`
        );
      } else {
        if (!sshValidation.permissionOk) {
          warnings.push(`SSH key permissions not strict: ${profile.ssh_key}`);
        }
        await upsertSshConfigForProfile(profile);
      }
    }

    const remoteUpdates: RemoteUpdate[] = [];
    if (isInsideGitRepo()) {
      const result = updateRemoteForProfile(profile.name, scope);

      remoteUpdates.push(...result.updated);

      for (const httpsWarn of result.httpsWarnings) {
        warnings.push(httpsWarn);
      }
    }

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
        scope,
      },
      remotes_updated: remoteUpdates,
      warnings,
    };

    if (json) {
      printJson({ success: true, data: payload });
    } else {
      for (const warning of warnings) printWarn(`Warning: ${warning}`);
      printSuccess(`Switched to ${profile.name} (${scope})`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
