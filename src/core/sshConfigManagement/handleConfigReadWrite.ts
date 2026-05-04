import fs from 'node:fs';
import { ensureSshExists, ensureSshConfigExists } from './sshconfig';
import { SSH_CONFIG_PATH } from '../../lib/constants';
import { backupFile } from '../profileManagement/storeBackup';
import { withLock } from '../profileManagement/fileLocking';
import { atomicWrite } from '../profileManagement/atomicWrite';
import type { Profile } from '../../lib/types/Profile.type';

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
  const keyPath = profile.ssh_key ?? '';
  return `# BEGIN gpx:${profile.name}
Host github.com-${profile.name}
    Hostname github.com
    User git
    IdentityFile "${keyPath}"
    IdentitiesOnly yes
# END gpx:${profile.name}
    `.trim();
};

export { readSshConfig, writeSshConfig, buildSshBlock };
