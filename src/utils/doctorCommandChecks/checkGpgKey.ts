import type { Profile } from '../../lib/types/Profile.type';
import type { CheckResult } from '../../lib/types/CheckResult.type';
import { safeGet } from '../../core/gitconfig';

export const checkGpgKey = (profile: Profile): CheckResult => {
  if (!profile.gpg_key) {
    return {
      label: `GPG key (${profile.name})`,
      status: 'pass',
      message: 'No GPG key configured (not required)',
    };
  }

  const output = safeGet(`gpg --list-keys ${profile.gpg_key} 2>&1`);

  if (output === null || output.includes('error') || output.includes('not found')) {
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
