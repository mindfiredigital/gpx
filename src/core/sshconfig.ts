import fs from 'node:fs';
import { SSH_DIR, SSH_CONFIG_PATH, ExitCode } from '../lib/constants';
import { backupFile } from './profileManagement/storeBackup';
import { atomicWrite } from './profileManagement/atomicWrite';
import { withLock } from './profileManagement/fileLocking';
import type { Profile } from '../lib/types/Profile.type';
import { ProfileError } from './profileManagement/errorClass';

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

const updateSshConfigForProfile = async (profile: Profile): Promise<void> => {
  if (!profile.ssh_key) return;
  if (!sshKeyExists(profile.ssh_key))
    throw new ProfileError('ssh key not found', ExitCode.SSH_KEY_MISSING);
  if (!sshKeyPermissionsOk(profile.ssh_key))
    throw new ProfileError('permission required', ExitCode.PERMISSION_ERROR);

  const config = readSshConfig();
  const block = buildSshBlock(profile);

  const start = `# BEGIN gpx:${profile.name}`;
  const end = `# END gpx:${profile.name}`;

  const regex = configRegex(start, end);

  let updated: string;

  if (config.match(regex)) {
    updated = config.replace(regex, block);
  } else updated = config.trim() + `\n\n` + block + `\n`;

  await writeSshConfig(updated);
};

const removeSshConfigForProfile = async (profileName: string): Promise<void> => {
  const config = readSshConfig();

  const start = `# BEGIN gpx:${profileName}`;
  const end = `# END gpx:${profileName}`;

  const regex = configRegex(start, end);

  const updated: string = config.replace(regex, '').trim() + '\n';

  await writeSshConfig(updated);
};

export {
  ensureSshExists,
  ensureSshConfigExists,
  buildSshBlock,
  sshKeyExists,
  sshKeyPermissionsOk,
  updateSshConfigForProfile,
  removeSshConfigForProfile,
};
