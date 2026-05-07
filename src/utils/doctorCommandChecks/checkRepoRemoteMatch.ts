import { isInsideGitRepo, getRemoteUrl, getGpxProfileFromRemote } from '../../core/gitconfig';
import type { Profile } from '../../lib/types/Profile.type';
import type { CheckResult } from '../../lib/types/CheckResult.type';

export const checkRepoRemoteMatch = (profile: Profile): CheckResult => {
  if (!isInsideGitRepo()) {
    return {
      label: 'Repo remote match',
      status: 'warn',
      message: 'Not inside a git repo (check skipped)',
    };
  }

  const remoteUrl = getRemoteUrl('origin');
  if (!remoteUrl) {
    return {
      label: 'Repo remote match',
      status: 'warn',
      message: 'No remote "origin" found',
    };
  }

  const remoteProfile = getGpxProfileFromRemote(remoteUrl);
  if (!remoteProfile) {
    return {
      label: 'Repo remote match',
      status: 'warn',
      message: `Remote URL does not use a gpx host alias: ${remoteUrl}`,
    };
  }

  if (remoteProfile !== profile.name) {
    return {
      label: 'Repo remote match',
      status: 'fail',
      message: `Remote uses "${remoteProfile}" but active profile is "${profile.name}"`,
    };
  }

  return {
    label: 'Repo remote match',
    status: 'pass',
    message: `Remote matches profile "${profile.name}"`,
  };
};
