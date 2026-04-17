import { removeProfile } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printSuccess } from '../utils/output';

export const runRemoveCommand = async (
  profileName: string,
  force: boolean,
  json: boolean
): Promise<number> => {
  try {
    await removeProfile(profileName, force);

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
