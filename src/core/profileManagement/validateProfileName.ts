import { PROFILE_NAME_MAX_LENGTH, PROFILE_NAME_REGEX } from '../../lib/validations';

export const validateProfileName = (name: string): { valid: boolean; reason?: string } => {
  if (!name) {
    return {
      valid: false,
      reason: 'Profile name cannot be empty',
    };
  }

  if (name.length > PROFILE_NAME_MAX_LENGTH) {
    return {
      valid: false,
      reason: 'Profile name too long',
    };
  }

  if (!PROFILE_NAME_REGEX.test(name)) {
    return {
      valid: false,
      reason: 'Invalid Profile name format',
    };
  }

  return { valid: true };
};
