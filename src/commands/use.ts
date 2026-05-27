import { getProfile, updateProfile } from '../core/profileManagement/profiles';
import { saveActive } from '../core/profileManagement/activeStore';
import {
  applyProfileToGitConfig,
  getGpxProfileFromRemote,
  getRemoteUrl,
  isInsideGitRepo,
  isHttpsRemote,
  updateRemoteForProfile,
  sshAliasToHttps,
  httpsToSshAlias,
  safeGet,
} from '../core/gitconfig';
import { ExitCode, PLATFORM } from '../lib/constants';
import { handleCommandError, printJson, printSuccess, printWarn } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';
import { upsertSshConfigForProfile } from '../core/sshConfigManagement/sshconfig';
import { validateSshKeyForProfile } from '../core/sshConfigManagement/sshKeyExistencePermissionCheck';
import { ensureCredentialHelperAdded } from '../core/credentialManagement/ensureHelper';
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
    const remoteUpdates: RemoteUpdate[] = [];

    // Warn when switching locally if the repo remote belongs to a different profile
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

    // Always apply git identity (user.name / user.email / gpg)
    applyProfileToGitConfig(profile, scope);

    const authMethod = profile.auth_method ?? 'ssh';

    if (authMethod === 'ssh') {
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

      if (isInsideGitRepo()) {
        const result = updateRemoteForProfile(profile.name, scope);
        remoteUpdates.push(...result.updated);

        for (const httpsWarnMsg of result.httpsWarnings) {
          const urlMatch = httpsWarnMsg.match(/\(([^)]+)\)/);
          const remoteNameMatch = httpsWarnMsg.match(/Remote "([^"]+)"/);
          const remoteName = remoteNameMatch?.[1] ?? 'origin';
          const httpsUrl = urlMatch?.[1];
          if (httpsUrl) {
            const sshAlias = httpsToSshAlias(httpsUrl, profile.name);
            if (sshAlias) {
              warnings.push(
                `Remote '${remoteName}' uses HTTPS - SSH auth needs an SSH URL.\n  Run: git remote set-url ${remoteName} ${sshAlias}`
              );
            } else {
              warnings.push(httpsWarnMsg);
            }
          } else {
            warnings.push(httpsWarnMsg);
          }
        }
      }
    } else if (authMethod === 'pat') {
      if (PLATFORM === 'win32') {
        throw new ProfileError(
          'PAT authentication is not supported on Windows.',
          ExitCode.INVALID_INPUT
        );
      }

      ensureCredentialHelperAdded();

      if (isInsideGitRepo()) {
        const remotesRaw = safeGet('git remote');
        const remotes = remotesRaw ? remotesRaw.split('\n').filter(Boolean) : [];

        for (const remote of remotes) {
          const remoteUrl = getRemoteUrl(remote);
          if (!remoteUrl) continue;

          if (!isHttpsRemote(remoteUrl)) {
            const httpsUrl = sshAliasToHttps(remoteUrl);
            if (httpsUrl) {
              warnings.push(
                `Remote '${remote}' uses SSH format - PAT needs an HTTPS URL.\n  Run: git remote set-url ${remote} ${httpsUrl}`
              );
            } else {
              warnings.push(
                `Remote '${remote}' is not a GitHub HTTPS URL. PAT auth requires HTTPS remotes.\n  Update it: git remote set-url ${remote} https://github.com/<owner>/<repo>.git`
              );
            }
          }
        }
      }
    }

    if (!local) {
      await saveActive({
        global: profile.name,
        switched_at: new Date().toISOString(),
      });
    }

    await updateProfile(profile.name, { last_used_at: new Date().toISOString() });

    const payload = {
      active: {
        name: profile.name,
        display_name: profile.display_name,
        email: profile.email,
        scope,
        auth_method: authMethod,
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
