import { spawnSync } from 'node:child_process';
import { PLATFORM, GPX_CREDENTIAL_HELPER } from '../../lib/constants';

export const ensureCredentialHelperAdded = (): void => {
  if (PLATFORM === 'win32') return;

  const result = spawnSync('git', [
    'config',
    '--global',
    '--get-all',
    'credential.https://github.com.helper',
  ]);
  let current: string[] | undefined;
  if (result.status === 0) {
    current = result.stdout
      .toString()
      .trim()
      .split('\n')
      .map((item) => item.trim());
    if (current.some((h) => h === GPX_CREDENTIAL_HELPER)) return; // already installed
  }

  spawnSync('git', ['config', '--global', 'credential.https://github.com.helper', '']);
  spawnSync('git', [
    'config',
    '--global',
    '--add',
    'credential.https://github.com.helper',
    GPX_CREDENTIAL_HELPER,
  ]);
};

export const removeCredentialHelper = (): void => {
  if (PLATFORM === 'win32') return;

  spawnSync('git', ['config', '--global', '--remove-section', 'credential.https://github.com']);
};
