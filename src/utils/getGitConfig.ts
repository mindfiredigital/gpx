import fs from 'node:fs';
import { CONFIG_DIR, CONFIG_FILE } from '../lib/constants';
import { type GithubPersonalAccessToken } from '../lib/types/GpxConfig.type';
import { withLock } from '../core/profileManagement/fileLocking';
import { backupFile } from '../core/profileManagement/storeBackup';
import { atomicWrite } from '../core/profileManagement/atomicWrite';

const readConfig = async (): Promise<GithubPersonalAccessToken> => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({}), { encoding: 'utf-8' });
      return {};
    }
    const config = fs.readFileSync(CONFIG_FILE, { encoding: 'utf-8' });
    return JSON.parse(config);
  } catch {
    return {};
  }
};

const writeConfig = async (config: GithubPersonalAccessToken): Promise<void> => {
  await withLock(() => {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    backupFile(CONFIG_FILE, 'github-access-token-backup');
    atomicWrite(CONFIG_FILE, JSON.stringify(config, null, 2));
  });
};

const addGithubToken = async (profileName: string, token: string): Promise<void> => {
  const config = await readConfig();
  await writeConfig({
    ...config,
    github_tokens: { ...config.github_tokens, [profileName]: token },
  });
};

const getGithubToken = async (profileName: string): Promise<string | null> => {
  const config = await readConfig();
  return config.github_tokens?.[profileName] ?? null;
};

const deleteGithubToken = async (profileName: string): Promise<void> => {
  const config = await readConfig();
  delete config.github_tokens?.[profileName];
  await writeConfig(config);
};

export { addGithubToken, getGithubToken, deleteGithubToken };
