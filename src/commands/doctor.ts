import { getProfile, listProfiles } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printHuman, fmt } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';
import type { CheckResult } from '../lib/types/CheckResult.type';
import { checkGitInstalled } from '../utils/doctorCommandChecks/checkGitInstalled';
import { checkGitIdentity } from '../utils/doctorCommandChecks/checkGitIdentity';
import { checkSshAgent } from '../utils/doctorCommandChecks/checkSshAgent';
import { checkSshKey } from '../utils/doctorCommandChecks/checkSshKey';
import { checkGpgKey } from '../utils/doctorCommandChecks/checkGpgKey';
import { checkRepoRemoteMatch } from '../utils/doctorCommandChecks/checkRepoRemoteMatch';

const printCheck = (check: CheckResult): void => {
  let icon: string, colorFn;

  if (check.status === 'pass') {
    icon = '✓';
    colorFn = fmt.green;
  } else if (check.status === 'warn') {
    icon = '⚠';
    colorFn = fmt.yellow;
  } else {
    icon = '✖';
    colorFn = fmt.red;
  }
  printHuman(`  ${colorFn(icon)} ${check.label}: ${check.message}`);
};

export const runDoctorCommand = async (
  profileName: string | undefined,
  json: boolean
): Promise<number> => {
  try {
    const checks: CheckResult[] = [];

    checks.push(checkGitInstalled());
    checks.push(checkGitIdentity());
    checks.push(checkSshAgent());

    if (profileName) {
      const profile = getProfile(profileName);
      if (!profile) {
        throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
      }

      checks.push(checkSshKey(profile));
      checks.push(checkGpgKey(profile));
      checks.push(checkRepoRemoteMatch(profile));
    } else {
      const profiles = listProfiles();

      for (const profile of profiles) {
        checks.push(checkSshKey(profile));
        checks.push(checkGpgKey(profile));
      }
    }

    const passCount = checks.filter((c) => c.status === 'pass').length;
    const warnCount = checks.filter((c) => c.status === 'warn').length;
    const failCount = checks.filter((c) => c.status === 'fail').length;

    if (json) {
      printJson({
        success: failCount === 0,
        data: {
          checks,
          summary: { pass: passCount, warn: warnCount, fail: failCount },
        },
      });
    } else {
      if (profileName) {
        printHuman(`\n${fmt.dim(`Diagnosing profile: ${profileName}`)}\n`);
      } else {
        printHuman(`\n${fmt.dim('Diagnosing system + all profiles')}\n`);
      }

      for (const check of checks) {
        printCheck(check);
      }
      printHuman(
        `\n${fmt.green(`${passCount} passed`)}, ${fmt.yellow(`${warnCount} warnings`)}, ${fmt.red(`${failCount} failed`)}`
      );
    }

    return failCount > 0 ? 1 : ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
