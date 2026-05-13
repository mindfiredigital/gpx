import { getProfile, removeProfile } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printSuccess } from '../utils/output';
import { removeSshConfigForProfile } from '../core/sshConfigManagement/sshconfig';

export const runRemoveCommand = async (
  profileName: string,
  force: boolean,
  json: boolean
): Promise<number> => {
  try {
    const profile = getProfile(profileName);
    await removeProfile(profileName, force);
    await removeSshConfigForProfile(profileName);

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
