import { getProfile } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printHuman, printJson, printSuccess } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';
import {
  storePatForProfile,
  deletePatForProfile,
} from '../core/credentialManagement/credentialStore';
import { validatePat } from '../core/githubManagement/validatePat';
import { ensureCredentialHelperAdded } from '../core/credentialManagement/ensureHelper';
import { password } from '@inquirer/prompts';

const runPatSetCommand = async (
  profileName: string,
  suppliedPat: string | undefined,
  json: boolean
): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    if (!profile) {
      throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
    }

    if (profile.auth_method !== 'pat') {
      throw new ProfileError(
        `Profile '${profileName}' is not a PAT profile (auth_method: ${profile.auth_method}). Only PAT profiles can have a PAT set.`,
        ExitCode.INVALID_INPUT
      );
    }

    let pat: string;
    if (suppliedPat && suppliedPat.trim().length > 0) {
      pat = suppliedPat.trim();
    } else {
      pat = await password({
        message: `Enter new Personal Access Token for '${profileName}':`,
        mask: '*',
      });
    }

    if (!pat || pat.trim().length === 0) {
      throw new ProfileError('PAT cannot be empty.', ExitCode.INVALID_INPUT);
    }
    pat = pat.trim();

    // Validate PAT with GitHub
    printHuman('Validating PAT with GitHub...');
    try {
      await validatePat(pat);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PAT validation failed';
      throw new ProfileError(message, ExitCode.INVALID_INPUT);
    }

    await storePatForProfile(profileName, pat);

    ensureCredentialHelperAdded();

    pat = '';

    if (json) {
      printJson({ success: true, data: { profile: profileName, pat_updated: true } });
    } else {
      printSuccess(`PAT updated for profile: ${profileName}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};

const runPatClearCommand = async (profileName: string, json: boolean): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    if (!profile) {
      throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
    }

    if (profile.auth_method !== 'pat') {
      throw new ProfileError(
        `Profile '${profileName}' is not a PAT profile.`,
        ExitCode.INVALID_INPUT
      );
    }

    await deletePatForProfile(profileName);

    if (json) {
      printJson({ success: true, data: { profile: profileName, pat_cleared: true } });
    } else {
      printSuccess(`PAT cleared for profile: ${profileName}`);
      printHuman(`To set a new PAT: gpx pat set ${profileName}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};

export { runPatSetCommand, runPatClearCommand };
