import fs from 'node:fs';
import { ensureGpxDir } from './directorySetup';
import { atomicWrite } from './atomicWrite';
import { CONFIG_PATH } from '../../lib/constants';
import { withLock } from './fileLocking';
import { backupFile } from './storeBackup';
import type { GpxConfig } from '../../lib/types/GpxConfig.type';

const defaultConfig = (): GpxConfig => ({
  auto_detect: false,
  auto_detect_notify: true,
});

const loadConfig = (): GpxConfig => {
  ensureGpxDir();

  if (!fs.existsSync(CONFIG_PATH)) {
    return defaultConfig();
  }

  const data = fs.readFileSync(CONFIG_PATH, { encoding: 'utf-8' });
  return { ...defaultConfig(), ...(JSON.parse(data) as Partial<GpxConfig>) };
};

const saveConfig = async (config: GpxConfig): Promise<void> => {
  ensureGpxDir();

  await withLock(() => {
    backupFile(CONFIG_PATH, 'backup');
    atomicWrite(CONFIG_PATH, JSON.stringify(config, null, 2));
  });
};

export { loadConfig, saveConfig };
