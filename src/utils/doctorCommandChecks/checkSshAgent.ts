import type { CheckResult } from '../../lib/types/CheckResult.type';
import { spawnSync } from 'node:child_process';

export const checkSshAgent = (): CheckResult => {
  const result = spawnSync('ssh-add', ['-l'], { encoding: 'utf-8' });
  const output = (result.stdout || '') + (result.stderr || '');

  if (
    result.status !== 0 &&
    !output.includes('The agent has no identities') &&
    !output.includes('Could not open a connection')
  ) {
    return {
      label: 'SSH agent',
      status: 'fail',
      message: 'Could not connect to ssh-agent, Please ensure your ssh-agent is running',
    };
  }

  if (output.includes('The agent has no identities')) {
    return {
      label: 'SSH agent',
      status: 'warn',
      message: 'SSH agent is running but has no keys loaded. Run: ssh-add <key-path>',
    };
  }

  if (output.includes('Could not open a connection')) {
    return {
      label: 'SSH agent',
      status: 'fail',
      message: 'SSH agent is not running. Run: eval "$(ssh-agent -s)"',
    };
  }

  const keyCount = output.split('\n').filter((line) => line.trim().length > 0).length;
  return {
    label: 'SSH agent',
    status: 'pass',
    message: `${keyCount === 1 ? `${keyCount} key` : `${keyCount} keys`} loaded`,
  };
};
