import { isInsideGitRepo, getRemoteUrl, getGpxProfileFromRemote } from './gitconfig';
import { getProfile } from './profileManagement/profiles';
import { loadActive } from './profileManagement/activeStore';
import type { AutoDetectResult } from '../lib/types/autoDetect.type';

const detectProfileFromRepo = (): AutoDetectResult => {
  const inRepo = isInsideGitRepo();
  if (!inRepo) {
    return {
      detectedProfile: null,
      currentProfileName: null,
      needsSwitch: false,
      reason: 'not inside a git repository',
    };
  }

  const remoteUrl = getRemoteUrl('origin');
  if (!remoteUrl) {
    return {
      detectedProfile: null,
      currentProfileName: null,
      needsSwitch: false,
      reason: 'no remote "origin" found',
    };
  }

  const profileNameFromRemote = getGpxProfileFromRemote(remoteUrl);
  if (!profileNameFromRemote) {
    return {
      detectedProfile: null,
      currentProfileName: null,
      needsSwitch: false,
      reason: 'remote URL does not use a gpx host alias',
    };
  }

  const detectedProfile = getProfile(profileNameFromRemote);
  if (!detectedProfile) {
    return {
      detectedProfile: null,
      currentProfileName: null,
      needsSwitch: false,
      reason: `profile "${profileNameFromRemote}" from remote URL not found in gpx`,
    };
  }

  const active = loadActive();
  const currentProfileName = active.global || null;

  const needsSwitch = currentProfileName !== detectedProfile.name;

  return {
    detectedProfile,
    currentProfileName,
    needsSwitch,
    reason: null,
  };
};

export { detectProfileFromRepo };
