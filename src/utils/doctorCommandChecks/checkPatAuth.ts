import type { CheckResult } from '../../lib/types/CheckResult.type';
import type { Profile } from '../../lib/types/Profile.type';
import { hasPatForProfile } from '../../core/credentialManagement/credentialStore';
import { PLATFORM } from '../../lib/constants';
import { spawnSync } from 'node:child_process';

const GPX_CREDENTIAL_HELPER = 'gpx git-credential';

export const checkPatAuth = async (profile: Profile): Promise<CheckResult[]> => {
  const results: CheckResult[] = [];

  if (PLATFORM === 'win32') {
    results.push({
      label: `PAT auth [${profile.name}]`,
      status: 'fail',
      message: 'PAT authentication is not supported on Windows',
    });
    return results;
  }

  const patPresent = await hasPatForProfile(profile.name);
  results.push({
    label: `PAT stored [${profile.name}]`,
    status: patPresent ? 'pass' : 'fail',
    message: patPresent
      ? 'PAT found in OS keychain'
      : `No PAT found. Run: gpx pat set ${profile.name}`,
  });

  let helperInstalled = false;
  try {
    const helpers = spawnSync('git', ['config', '--global', '--get-all', 'credential.helper']).stdout.toString()
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
      ? `credential.helper = "${GPX_CREDENTIAL_HELPER}"`
      : `gpx credential helper not registered. Run: gpx use ${profile.name}`,
  });

  return results;
};
