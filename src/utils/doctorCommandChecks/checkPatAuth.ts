import type { CheckResult } from '../../lib/types/CheckResult.type';
import type { Profile } from '../../lib/types/Profile.type';
import { hasPatForProfile } from '../../core/credentialManagement/credentialStore';
import { GPX_CREDENTIAL_HELPER } from '../../lib/constants';
import { spawnSync } from 'node:child_process';

export const checkPatAuth = async (profile: Profile): Promise<CheckResult[]> => {
  const results: CheckResult[] = [];

  const patPresent = await hasPatForProfile(profile.name);
  results.push({
    label: `PAT stored [${profile.name}]`,
    status: patPresent ? 'pass' : 'fail',
    message: patPresent
      ? 'PAT found in credential store'
      : `No PAT found. Run: gpx pat set ${profile.name}`,
  });

  let helperInstalled: boolean | undefined;
  try {
    const helpers = spawnSync('git', [
      'config',
      '--global',
      '--get-all',
      'credential.https://github.com.helper',
    ])
      .stdout.toString()
      .trim()
      .split('\n')
      .map((item) => item.trim());
    helperInstalled = helpers.some((h) => h === GPX_CREDENTIAL_HELPER);
  } catch {
    helperInstalled = false;
  }

  results.push({
    label: `Git credential helper [${profile.name}]`,
    status: helperInstalled ? 'pass' : 'warn',
    message: helperInstalled
      ? `credential.https://github.com.helper = "${GPX_CREDENTIAL_HELPER}"`
      : `gpx credential helper not registered for GitHub. Run: gpx use ${profile.name}`,
  });

  return results;
};
