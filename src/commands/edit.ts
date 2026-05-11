import fs from 'node:fs';
import { applyProfileToGitConfig } from '../core/gitconfig';
import { loadActive } from '../core/profileManagement/activeStore';
import { ProfileError } from '../core/profileManagement/errorClass';
import { getProfile, updateProfile } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import type { Profile } from '../lib/types/Profile.type';
import { handleCommandError, printHuman, printJson, printSuccess } from '../utils/output';

export const runEditCommand = async (
  profileName: string,
  options: { sshKey?: string; gpgKey?: string; signing?: boolean },
  json: boolean
): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    if (!profile) {
      throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
    }

    if (!options.sshKey && !options.gpgKey && !options.signing)
      throw new ProfileError(
        `Use atleast one of --ssh-key, --gpg-key or --signing`,
        ExitCode.INVALID_INPUT
      );

    const updateProfileData: Partial<Profile> = {};
    const changes: string[] = [];

    if (options.sshKey !== undefined) {
      if (fs.existsSync(options.sshKey)) {
        updateProfileData.ssh_key = options.sshKey;
        changes.push(`ssh_key -> ${options.sshKey}`);
      } else {
        throw new ProfileError(`Invalid Path: ssh_key, please try again!`, ExitCode.INVALID_INPUT);
      }
    }

    if (options.gpgKey !== undefined) {
      updateProfileData.gpg_key = options.gpgKey;
      changes.push(`gpg_key -> ${options.gpgKey}`);
    }

    if (options.signing !== undefined) {
      updateProfileData.signing_commits = options.signing;
      changes.push(`signing_commits -> ${options.signing}`);
    }

    await updateProfile(profileName, updateProfileData);

    const active = loadActive();
    const isActive = active.global === profileName;

    if (isActive) {
      const updatedProfile = getProfile(profileName);
      if (updatedProfile) applyProfileToGitConfig(updatedProfile, 'global');
    }

    if (json) {
      printJson({
        success: true,
        data: {
          profile: profileName,
          changes: updateProfileData,
        },
      });
    } else {
      for (const change of changes) {
        printHuman(`${change}`);
      }
      printSuccess(`Updated Profile: ${profileName}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
