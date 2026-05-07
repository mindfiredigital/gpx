import type { Profile } from '../../lib/types/Profile.type';
import type { CheckResult } from '../../lib/types/CheckResult.type';
import { validateSshKeyForProfile } from '../../core/sshConfigManagement/sshKeyExistencePermissionCheck';

export const checkSshKey = (profile: Profile): CheckResult => {
  if (!profile.ssh_key) {
    return {
      label: `SSH key (${profile.name})`,
      status: 'warn',
      message: 'No SSH key configured for this profile',
    };
  }

  const validation = validateSshKeyForProfile(profile);

  if (!validation.exists) {
    return {
      label: `SSH key (${profile.name})`,
      status: 'fail',
      message: `SSH key not found: ${profile.ssh_key}`,
    };
  }

  if (!validation.permissionOk) {
    return {
      label: `SSH key (${profile.name})`,
      status: 'warn',
      message: `SSH key exists but permissions are not strict (should be 600): ${profile.ssh_key}`,
    };
  }

  return {
    label: `SSH key (${profile.name})`,
    status: 'pass',
    message: `${profile.ssh_key} (permissions OK)`,
  };
};
