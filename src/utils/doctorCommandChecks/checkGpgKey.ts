import type { Profile } from '../../lib/types/Profile.type';
import type { CheckResult } from '../../lib/types/CheckResult.type';
import { spawnSync } from 'node:child_process';

export const checkGpgKey = (profile: Profile): CheckResult => {
  if (!profile.gpg_key) {
    return {
      label: `GPG key (${profile.name})`,
      status: 'pass',
      message: 'No GPG key configured (not required)',
    };
  }

  const result = spawnSync('gpg', ['--list-keys', profile.gpg_key], { encoding: 'utf-8' });

  if (result.status !== 0) {
    return {
      label: `GPG key (${profile.name})`,
      status: 'fail',
      message: `GPG key not found: ${profile.gpg_key}`,
    };
  }

  return {
    label: `GPG key (${profile.name})`,
    status: 'pass',
    message: `GPG key found: ${profile.gpg_key}`,
  };
};
