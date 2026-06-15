import fs from 'node:fs';
import { applyProfileToGitConfig } from '../core/gitconfig';
import { loadActive } from '../core/profileManagement/activeStore';
import { ProfileError } from '../core/profileManagement/errorClass';
import { getProfile, updateProfile } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import type { Profile } from '../lib/types/Profile.type';
import { handleCommandError, printHuman, printJson, printSuccess } from '../utils/output';
import { upsertSshConfigForProfile } from '../core/sshConfigManagement/sshconfig';

export const runEditCommand = async (
  profileName: string,
  options: {
    displayName?: string;
    email?: string;
    sshKey?: string;
    gpgKey?: string;
    signing?: boolean;
    githubUsername?: string;
  },
  json: boolean
): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    if (!profile) {
      throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
    }

    if (
      !options.displayName &&
      !options.email &&
      !options.sshKey &&
      !options.gpgKey &&
      options.signing === undefined &&
      !options.githubUsername
    )
      throw new ProfileError(
        `Use: gpx edit --help \nEnter atleast one valid flag`,
        ExitCode.INVALID_INPUT
      );

    const authMethod = profile.auth_method;
    if (authMethod === 'pat') {
      if (options.sshKey !== undefined) {
        throw new ProfileError('SSH key cannot be set on a PAT profile.', ExitCode.INVALID_INPUT);
      }
    } else if (authMethod === 'ssh') {
      if (options.githubUsername !== undefined) {
        throw new ProfileError(
          'GitHub username cannot be set on an SSH profile.',
          ExitCode.INVALID_INPUT
        );
      }
    }

    const updateProfileData: Partial<Profile> = {};
    const changes: string[] = [];

    if (options.displayName !== undefined) {
      updateProfileData.display_name = options.displayName;
      changes.push(`display_name -> ${options.displayName}`);
    }

    if (options.email !== undefined) {
      updateProfileData.email = options.email;
      changes.push(`email -> ${options.email}`);
    }

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

    if (options.githubUsername !== undefined) {
      updateProfileData.github_username = options.githubUsername;
      changes.push(`github_username -> ${options.githubUsername}`);
    }

    await updateProfile(profileName, updateProfileData);

    const active = loadActive();
    const isActive = active.global === profileName;

    if (isActive) {
      const updatedProfile = getProfile(profileName);
      if (updatedProfile) {
        applyProfileToGitConfig(updatedProfile, 'global');
        if (options.sshKey && updatedProfile.ssh_key) {
          await upsertSshConfigForProfile(updatedProfile);
        }
      }
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
