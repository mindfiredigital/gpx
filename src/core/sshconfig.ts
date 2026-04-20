import fs from 'node:fs';
import { SSH_DIR, SSH_CONFIG_PATH } from '../lib/constants';
import { backupFile } from './profileManagement/storeBackup';
import { atomicWrite } from './profileManagement/atomicWrite';
import { withLock } from './profileManagement/fileLocking';
import type { Profile } from '../lib/types/Profile.type';

const configRegex = (start: string, end: string) => {
  return new RegExp(`${start}[\\s\\S]*?${end}`, 'g');
};

const ensureSshExists = (): void => {
  if (!fs.existsSync(SSH_DIR)) fs.mkdirSync(SSH_DIR, { recursive: true });
};

const ensureSshConfigExists = (): void => {
  if (!fs.existsSync(SSH_CONFIG_PATH)) fs.writeFileSync(SSH_CONFIG_PATH, '', { encoding: 'utf-8' });
};

const readSshConfig = (): string => {
  ensureSshExists();
  ensureSshConfigExists();

  return fs.readFileSync(SSH_CONFIG_PATH, { encoding: 'utf-8' });
};

const writeSshConfig = async (content: string): Promise<void> => {
  ensureSshExists();
  ensureSshConfigExists();

  await withLock(() => {
    backupFile(SSH_CONFIG_PATH, 'ssh-backup');
    atomicWrite(SSH_CONFIG_PATH, content);
  });
};

const buildSshBlock = (profile: Profile): string => {
  const host = `gpx-${profile.name}`;
  return `
    # BEGIN gpx:${profile.name}
    Host ${host}
        Hostname github.com
        User git
        IdentityFile ${profile.ssh_key}
    # END gpx:${profile.name}
    `.trim();
};

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

export {
  ensureSshExists,
  ensureSshConfigExists,
  buildSshBlock,
  sshKeyExists,
  sshKeyPermissionsOk,
  configRegex,
  readSshConfig,
  writeSshConfig,
};
