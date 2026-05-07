import type { CheckResult } from '../../lib/types/CheckResult.type';
import { getCurrentGitIdentity } from '../../core/gitconfig';

export const checkGitIdentity = (): CheckResult => {
  const identity = getCurrentGitIdentity('global');

  if (identity.name && identity.email) {
    return {
      label: 'Git identity configured',
      status: 'pass',
      message: `${identity.name} <${identity.email}>`,
    };
  }

  if (!identity.name && !identity.email) {
    return {
      label: 'Git identity configured',
      status: 'fail',
      message: 'Either user.name or user.email is not set in global git config',
    };
  }

  return {
    label: 'Git identity configured',
    status: 'warn',
    message:
      `Missing: ${!identity.name ? 'user.name' : ''} ${!identity.email ? 'user.email' : ''}`.trim(),
  };
};
