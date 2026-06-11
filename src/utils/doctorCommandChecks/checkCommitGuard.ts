import fs from 'node:fs';
import path from 'node:path';
import type { CheckResult } from '../../lib/types/CheckResult.type';
import { isInsideGitRepo, getGitRepoRoot, getExpectedProfile } from '../../core/gitconfig';

export const checkCommitGuard = (): CheckResult => {
  if (!isInsideGitRepo()) {
    return {
      label: 'Commit Guard',
      status: 'warn',
      message: 'Not inside a git repo (check skipped)',
    };
  }

  const repoRoot = getGitRepoRoot();
  if (!repoRoot) {
    return {
      label: 'Commit Guard',
      status: 'warn',
      message: 'Could not determine git repository root',
    };
  }

  const preCommitPath = path.join(repoRoot, '.git', 'hooks', 'pre-commit');
  if (fs.existsSync(preCommitPath)) {
    const hookContent = fs.readFileSync(preCommitPath, { encoding: 'utf-8' });
    if (hookContent.includes('gpx verify-commit')) {
      const expected = getExpectedProfile();
      if (expected) {
        return {
          label: 'Commit Guard',
          status: 'pass',
          message: `Enabled ✓ (Locked to: '${expected}')`,
        };
      } else {
        return {
          label: 'Commit Guard',
          status: 'fail',
          message: `Hook installed, but expected profile is missing. Run 'gpx guard'`,
        };
      }
    }
  }

  return {
    label: 'Commit Guard',
    status: 'warn',
    message: "Disabled ! (Run 'gpx guard' to enable)",
  };
};
