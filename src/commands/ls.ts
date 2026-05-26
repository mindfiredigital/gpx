import { listProfiles } from '../core/profileManagement/profiles';
import { loadActive } from '../core/profileManagement/activeStore';
import { ExitCode } from '../lib/constants';
import { fmt, handleCommandError, printHuman, printJson } from '../utils/output';

export const runLsCommand = async (json: boolean): Promise<number> => {
  try {
    const profiles = listProfiles();
    const active = loadActive().global;

    if (json) {
      printJson({ success: true, data: { profiles, active } });
      return ExitCode.SUCCESS;
    }

    if (profiles.length === 0) {
      printHuman('No profiles found');
      return ExitCode.SUCCESS;
    }

    for (const profile of profiles) {
      const marker = active === profile.name ? fmt.green('*') : ' ';
      printHuman(`${marker} ${profile.name}  ${profile.display_name} <${profile.email}>`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
