import fs from 'node:fs';
import { SSH_DIR, SSH_CONFIG_PATH } from '../lib/constants';
import { backupFile } from './profileManagement/storeBackup';
import { atomicWrite } from './profileManagement/atomicWrite';
import { withLock } from './profileManagement/fileLocking';

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

export { ensureSshExists, ensureSshConfigExists, readSshConfig, writeSshConfig };
