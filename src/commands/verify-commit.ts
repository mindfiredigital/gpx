import { loadActive } from '../core/profileManagement/activeStore';
import { getGpxLocalProfileName, getExpectedProfile, isInsideGitRepo } from '../core/gitconfig';
import { ExitCode } from '../lib/constants';
import { printError } from '../utils/output';

export const runVerifyCommitCommand = async (): Promise<number> => {
  try {
    if (!isInsideGitRepo()) {
      return ExitCode.SUCCESS;
    }

    const active = loadActive();
    const activeGlobalProfile = active.global;
    const activeLocalProfile = getGpxLocalProfileName();
    const currentIdentity = activeLocalProfile || activeGlobalProfile;

    const expectedProfile: string | null = getExpectedProfile();

    if (expectedProfile && currentIdentity && expectedProfile !== currentIdentity) {
      printError(
        `\n✗ Commit Blocked!\nYou are trying to commit with '${currentIdentity}' \nCommits are allowed to the profile : '${expectedProfile}'\n\nPlease switch to the correct profile,\nRun: gpx use ${expectedProfile}\n`
      );
      return 1;
    }

    return ExitCode.SUCCESS;
  } catch {
    return ExitCode.SUCCESS;
  }
};
