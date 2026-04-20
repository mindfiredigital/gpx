import fs from 'node:fs';
import type { ProfilesStore } from '../../lib/types/Profile.type';
import { ensureGpxDir } from './directorySetup';
import { atomicWrite } from './atomicWrite';
import { PROFILES_PATH } from '../../lib/constants';
import { withLock } from './fileLocking';
import { backupFile } from './storeBackup';

// Profile store
const loadProfiles = (): ProfilesStore => {
  ensureGpxDir();
  if (!fs.existsSync(PROFILES_PATH)) {
    return { version: 1, profiles: [] };
  }

  const data = fs.readFileSync(PROFILES_PATH, 'utf-8');
  return JSON.parse(data);
};

const saveProfiles = async (store: ProfilesStore): Promise<void> => {
  ensureGpxDir();

  await withLock(() => {
    backupFile(PROFILES_PATH, 'backup');
    atomicWrite(PROFILES_PATH, JSON.stringify(store, null, 2));
  });
};

export { loadProfiles, saveProfiles };
