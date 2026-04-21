import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import type { GeneratedSshKey } from '../../lib/types/SshConfig.type';
import { ensureSshExists } from './sshconfig';
import { ExitCode, SSH_DIR } from '../../lib/constants';
import { ProfileError } from '../profileManagement/errorClass';

export const generateSshKeyForProfile = (profileName: string, email: string): GeneratedSshKey => {
  ensureSshExists();
  const privateKeyPath = path.join(SSH_DIR, `id_ed25519_gpx_${profileName}`);
  const publicKeyPath = `${privateKeyPath}.pub`;

  if (fs.existsSync(privateKeyPath) || fs.existsSync(publicKeyPath))
    throw new ProfileError(`SSH key already exists: ${privateKeyPath}`, ExitCode.INVALID_INPUT);

  try {
    execFileSync('ssh-keygen', ['-t', 'ed25519', '-f', privateKeyPath, '-C', email, '-N', '']);
  } catch {
    throw new ProfileError(`Failed to generate SSK Key`, ExitCode.INVALID_INPUT);
  }

  let publicKey: string;
  try {
    publicKey = fs.readFileSync(publicKeyPath, { encoding: 'utf-8' }).trim();
  } catch {
    throw new ProfileError(`Failed to read generated SSH Public Key`, ExitCode.PERMISSION_ERROR);
  }

  return {
    privateKeyPath,
    publicKeyPath,
    publicKey,
  };
};
