import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { SSH_DIR, SSH_CONFIG_PATH, ExitCode } from '../../lib/constants';
import { readSshConfig, writeSshConfig, buildSshBlock } from './handleConfigReadWrite';
import type { Profile } from '../../lib/types/Profile.type';
import { ProfileError } from '../profileManagement/errorClass';
import { validateSshKeyForProfile } from './sshKeyExistencePermissionCheck';
import { configRegex } from './sshBlockRegex';

const ensureSshExists = (): void => {
  if (!fs.existsSync(SSH_DIR)) fs.mkdirSync(SSH_DIR, { recursive: true });
};

const ensureSshConfigExists = (): void => {
  if (!fs.existsSync(SSH_CONFIG_PATH)) fs.writeFileSync(SSH_CONFIG_PATH, '', { encoding: 'utf-8' });
};

const upsertSshConfigForProfile = async (profile: Profile): Promise<void> => {
  if (!profile.ssh_key) return;

  const { exists, permissionOk } = validateSshKeyForProfile(profile);
  if (!exists) throw new ProfileError('ssh key not found', ExitCode.SSH_KEY_MISSING);
  if (!permissionOk) throw new ProfileError('permission required', ExitCode.PERMISSION_ERROR);

  const [config, newProfileBlock] = [readSshConfig(), buildSshBlock(profile)];
  const [start, end] = [`# BEGIN gpx:${profile.name}`, `# END gpx:${profile.name}`];

  const profileBlock = configRegex(start, end);

  let updated: string;
  if (config.match(profileBlock)) {
    updated = config.replace(profileBlock, newProfileBlock);
  } else
    updated =
      config.length > 0 ? `${config.trimEnd()}\n\n${newProfileBlock}` : `${newProfileBlock}`;

  await writeSshConfig(`${updated.trimEnd()}\n`);
};

const removeSshConfigForProfile = async (
  profileName: string,
  privateKeyPath: string | undefined
): Promise<void> => {
  const config = readSshConfig();
  const [start, end] = [`# BEGIN gpx:${profileName}`, `# END gpx:${profileName}`];

  const profileBlock = configRegex(start, end);

  if (!config.match(profileBlock)) return;
  let updated: string;

  updated = config
    .replace(profileBlock, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
  const newContent = updated.length > 0 ? `${updated}\n` : updated;
  await writeSshConfig(newContent);
  if (privateKeyPath) {
    try {
      execFileSync('ssh-add', ['-d', privateKeyPath]);
    } catch {
      throw new ProfileError(`Error adding key to ssh-agent`, ExitCode.PERMISSION_ERROR);
    }
  }
};

export {
  ensureSshExists,
  ensureSshConfigExists,
  upsertSshConfigForProfile,
  removeSshConfigForProfile,
};
