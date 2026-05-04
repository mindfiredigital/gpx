import type { Profile } from './Profile.type';

export interface AutoDetectResult {
  detectedProfile: Profile | null;
  currentProfileName: string | null;
  needsSwitch: boolean;
  reason: string | null;
}
