import type { Profile, ProfilesStore } from '../../lib/types/Profile.type';
import { ExitCode } from '../../lib/constants';
import { loadProfiles, saveProfiles } from './profileStore';
import { ProfileError } from './errorClass';
import { loadActive } from './activeStore';
import { validateProfileName } from './validateProfileName';

// Profile CRUD
const getProfile = (name: string): Profile | undefined => {
  const store: ProfilesStore = loadProfiles();
  return store.profiles.find((p) => p.name === name);
};

const listProfiles = (): Profile[] => {
  return loadProfiles().profiles;
};

const addProfile = async (profile: Profile): Promise<void> => {
  const store: ProfilesStore = loadProfiles();
  const exists = store.profiles.some((p) => p.name === profile.name);
  if (exists) {
    throw new ProfileError('profile already exists', ExitCode.PROFILE_ALREADY_EXISTS);
  }

  store.profiles.push(profile);
  await saveProfiles(store);
};

const updateProfile = async (name: string, updates: Partial<Profile>): Promise<void> => {
  const store: ProfilesStore = loadProfiles();

  if (updates.name) {
    const exists = store.profiles.some((p) => p.name === updates.name && p.name !== name);
    if (exists) {
      throw new ProfileError('profile already exists', ExitCode.PROFILE_ALREADY_EXISTS);
    }
  }

  const index = store.profiles.findIndex((p) => p.name === name);
  if (index === -1) {
    throw new ProfileError('profile not found', ExitCode.PROFILE_NOT_FOUND);
  }

  store.profiles[index] = {
    ...store.profiles[index],
    ...updates,
  } as Profile;

  await saveProfiles(store);
};

const removeProfile = async (name: string, force?: boolean): Promise<void> => {
  const store: ProfilesStore = loadProfiles();
  const active = getActiveProfileName();

  if (active === name && !force) {
    throw new ProfileError('cannot remove active profile. Use --force', ExitCode.INVALID_INPUT);
  }

  const updatedProfiles = store.profiles.filter((p) => p.name !== name);

  if (updatedProfiles.length === store.profiles.length) {
    throw new ProfileError('profile not found', ExitCode.PROFILE_NOT_FOUND);
  }

  store.profiles = updatedProfiles;
  await saveProfiles(store);
};

const getActiveProfileName = (): string | null => {
  const active = loadActive();
  return active.global;
};

export { validateProfileName, getProfile, listProfiles, addProfile, updateProfile, removeProfile };
