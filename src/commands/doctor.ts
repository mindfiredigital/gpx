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
import { checkPatAuth } from '../utils/doctorCommandChecks/checkPatAuth';

const printCheck = (check: CheckResult): void => {
  let icon: string, colorFn;

  if (check.status === 'pass') {
    icon = '✓';
    colorFn = fmt.green;
  } else if (check.status === 'warn') {
    icon = '⚠';
    colorFn = fmt.yellow;
  } else {
    icon = '✗';
    colorFn = fmt.red;
  }
  printHuman(`  ${colorFn(icon)}  ${check.label}: ${check.message}`);
};

export const runDoctorCommand = async (
  profileName: string | undefined,
  json: boolean
): Promise<number> => {
  try {
    const checks: CheckResult[] = [];

    checks.push(checkGitInstalled());
    checks.push(checkGitIdentity());

    if (profileName) {
      const profile = getProfile(profileName);
      if (!profile) {
        throw new ProfileError(`Profile not found: ${profileName}`, ExitCode.PROFILE_NOT_FOUND);
      }

      if (profile.auth_method === 'pat') {
        const patChecks = await checkPatAuth(profile);
        checks.push(...patChecks);
        checks.push(checkGpgKey(profile));
        checks.push(checkRepoRemoteMatch(profile));
      } else {
        checks.push(checkSshAgent());
        checks.push(checkSshKey(profile));
        checks.push(checkGpgKey(profile));
        checks.push(checkRepoRemoteMatch(profile));
      }
    } else {
      checks.push(checkSshAgent());
      const profiles = listProfiles();
      const hasSshProfile = profiles.some((p) => p.auth_method === 'ssh');

      if (hasSshProfile) {
        checks.push(checkSshAgent());
      }

      for (const profile of profiles) {
        if (profile.auth_method === 'pat') {
          const patChecks = await checkPatAuth(profile);
          checks.push(...patChecks);
        } else {
          checks.push(checkSshKey(profile));
        }
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
        `\n${fmt.green(`${passCount} passed`)}${warnCount > 0 || failCount > 0 ? ', ' : ''}${warnCount > 0 ? fmt.yellow(`${warnCount} warnings${failCount > 0 ? ', ' : ''}`) : ''}${failCount > 0 ? fmt.red(`${failCount} failed`) : ''}`
      );
    }

    return failCount > 0 ? 1 : ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
