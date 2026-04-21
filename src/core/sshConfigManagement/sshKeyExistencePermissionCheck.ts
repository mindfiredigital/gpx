import fs from 'node:fs';
import type { Profile } from '../../lib/types/Profile.type';
import type { sshKeyValidationResult } from '../../lib/types/SshConfig.type';

const sshKeyExists = (keyPath: string): boolean => {
  return fs.existsSync(keyPath);
};

const sshKeyPermissionsOk = (keyPath: string): boolean => {
  try {
    if (process.platform === 'win32') return true;
    const stat = fs.statSync(keyPath);
    return (stat.mode & 0o777) === 0o600;
  } catch {
    return false;
  }
};

const validateSshKeyForProfile = (profile: Profile): sshKeyValidationResult => {
  if (!profile.ssh_key)
    return {
      exists: false,
      permissionOk: false,
    };
  const exists = sshKeyExists(profile.ssh_key);
  const permissionOk = exists ? sshKeyPermissionsOk(profile.ssh_key) : false;

  return { exists, permissionOk };
};

export { sshKeyExists, sshKeyPermissionsOk, validateSshKeyForProfile };
