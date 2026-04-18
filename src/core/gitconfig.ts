import path from 'node:path';
import { execSync } from 'node:child_process';
import type { Profile } from '../lib/types';
import { ExitCode, HOME_DIR } from '../lib/constants';
import { ProfileError } from './profileManagement/errorClass';
import { backupFile } from './profileManagement/storeBackup';

type GitScope = 'global' | 'local';

type GitIdentity = {
  name: string | null;
  email: string | null;
  signingKey: string | null;
};

const run = (cmd: string): string => {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
};

const safeGet = (cmd: string): string | null => {
  try {
    const value = run(cmd);
    return value || null;
  } catch {
    return null;
  }
};

const scopeFlag = (scope: GitScope): '--global' | '--local' => {
  return scope === 'local' ? '--local' : '--global';
};

const ensureGitInstalled = (): void => {
  try {
    run('git --version');
  } catch {
    throw new ProfileError('git is not installed', ExitCode.GIT_NOT_INSTALLED);
  }
};

const getGitVersion = (): string => {
  ensureGitInstalled();
  return run('git --version');
};

const getCurrentGitIdentity = (scope: GitScope = 'global'): GitIdentity => {
  ensureGitInstalled();

  if (scope === 'local' && !isInsideGitRepo()) {
    return { name: null, email: null, signingKey: null };
  }

  const flag = scopeFlag(scope);
  return {
    name: safeGet(`git config ${flag} --get user.name`),
    email: safeGet(`git config ${flag} --get user.email`),
    signingKey: safeGet(`git config ${flag} --get user.signingkey`),
  };
};

const applyProfileToGitConfig = (profile: Profile, scope: GitScope = 'global'): void => {
  ensureGitInstalled();

  if (scope === 'local' && !isInsideGitRepo()) {
    throw new ProfileError('not inside a git repository', ExitCode.NOT_A_GIT_REPO);
  }

  const flag = scopeFlag(scope);
  if (scope === 'global') {
    const gitConfigPath = path.join(HOME_DIR, '.gitconfig');
    backupFile(gitConfigPath, 'backup');
  }

  run(`git config ${flag} user.name "${profile.display_name}"`);
  run(`git config ${flag} user.email "${profile.email}"`);

  if (profile.gpg_key) {
    run(`git config ${flag} user.signingkey "${profile.gpg_key}"`);
  } else {
    const existingSigningKey = safeGet(`git config ${flag} --get user.signingkey`);
    if (existingSigningKey) run(`git config ${flag} --unset user.signingkey`);
  }

  if (profile.signing_commits === true) {
    run(`git config ${flag} commit.gpgsign true`);
  } else {
    run(`git config ${flag} commit.gpgsign false`);
  }
};

const isInsideGitRepo = (): boolean => {
  ensureGitInstalled();
  try {
    return run('git rev-parse --is-inside-work-tree') === 'true';
  } catch {
    return false;
  }
};

const getGitRepoRoot = (): string | null => {
  ensureGitInstalled();
  try {
    return run('git rev-parse --show-toplevel');
  } catch {
    return null;
  }
};

export {
  ensureGitInstalled,
  getGitVersion,
  getCurrentGitIdentity,
  applyProfileToGitConfig,
  isInsideGitRepo,
  getGitRepoRoot,
};
