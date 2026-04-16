import fs from 'node:fs';
import type { ActiveStore } from '../../lib/types';
import { ensureGpxDir } from './directorySetup';
import { atomicWrite } from './atomicWrite';
import { ACTIVE_PATH } from '../../lib/constants';
import { withLock } from './fileLocking';
import { backupFile } from './storeBackup';

// Active store
const loadActive = (): ActiveStore => {
  ensureGpxDir();
  if (!fs.existsSync(ACTIVE_PATH)) {
    return { global: null, switched_at: null };
  }

  const data = fs.readFileSync(ACTIVE_PATH, 'utf-8');

  return JSON.parse(data);
};

const saveActive = async (store: ActiveStore): Promise<void> => {
  ensureGpxDir();
  await withLock(() => {
    backupFile(ACTIVE_PATH, 'backup');
    atomicWrite(ACTIVE_PATH, JSON.stringify(store, null, 2));
  });
};

export { loadActive, saveActive };
