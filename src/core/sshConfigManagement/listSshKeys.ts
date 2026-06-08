import fs from 'node:fs';
import path from 'node:path';
import { SSH_DIR } from '../../lib/constants';

export interface SshKeyEntry {
  name: string;
  privateKeyPath: string;
  publicKeyPath: string;
}

export const listExistingSshKeys = (): SshKeyEntry[] => {
  if (!fs.existsSync(SSH_DIR)) return [];

  let files: string[];
  try {
    files = fs.readdirSync(SSH_DIR);
  } catch {
    return [];
  }

  const NON_KEY_FILES = new Set(['config', 'known_hosts', 'known_hosts.old']);

  const pubKeySet = new Set(files.filter((f) => f.endsWith('.pub')));

  return files
    .filter((f) => {
      if (f.endsWith('.pub')) return false;
      if (NON_KEY_FILES.has(f)) return false;
      return pubKeySet.has(`${f}.pub`);
    })
    .map((f) => ({
      name: f,
      privateKeyPath: path.join(SSH_DIR, f),
      publicKeyPath: path.join(SSH_DIR, `${f}.pub`),
    }));
};
