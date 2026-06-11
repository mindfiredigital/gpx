import { detectProfileFromRepo } from '../core/autodetect';
import { applyProfileToGitConfig, getExpectedProfile } from '../core/gitconfig';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printHuman } from '../utils/output';

export async function runAutoDetectCommand(json: boolean): Promise<number> {
  try {
    const result = detectProfileFromRepo();

    if (!result.detectedProfile) {
      if (json) {
        printJson({
          success: true,
          data: {
            switched: false,
            reason: result.reason,
          },
        });
      }
      return ExitCode.SUCCESS;
    }

    if (!result.needsSwitch) {
      if (json) {
        printJson({
          success: true,
          data: {
            switched: false,
            reason: 'already on correct profile',
            active_profile: result.detectedProfile.name,
          },
        });
      }
      return ExitCode.SUCCESS;
    }

    const profile = result.detectedProfile;

    applyProfileToGitConfig(profile, 'local');

    if (json) {
      printJson({
        success: true,
        data: {
          switched: true,
          from_profile: result.currentProfileName,
          to_profile: profile.name,
          display_name: profile.display_name,
          email: profile.email,
        },
      });
    } else {
      printHuman(
        `Auto-switched: ${result.currentProfileName} -> ${profile.name} (${profile.display_name} <${profile.email}>)`
      );
      const expectedProfile = getExpectedProfile();
      if (!expectedProfile) {
        printHuman(`💡 Tip: To prevent accidental commits, run 'gpx guard'`);
      }
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
}
