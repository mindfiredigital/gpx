import type { CheckResult } from '../../lib/types/CheckResult.type';
import { getGitVersion } from '../../core/gitconfig';

export const checkGitInstalled = (): CheckResult => {
  try {
    const version = getGitVersion();
    return {
      label: 'Git installed',
      status: 'pass',
      message: version,
    };
  } catch {
    return {
      label: 'Git installed',
      status: 'fail',
      message: 'git is not installed or not in PATH',
    };
  }
};
