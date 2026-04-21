// Validation
const PROFILE_NAME_REGEX: RegExp = /^[a-zA-Z0-9-_]+$/;
const PROFILE_NAME_MAX_LENGTH: number = 35;

// ssh config block name
const SSH_CONFIG_NAME_REGEX: RegExp = /[.?+*$(){}|[\]\\^]/g;
const SSH_CONFIG_NAME_REGEX_REPLACEMENT: string = '\\$&';

export {
  PROFILE_NAME_REGEX,
  PROFILE_NAME_MAX_LENGTH,
  SSH_CONFIG_NAME_REGEX,
  SSH_CONFIG_NAME_REGEX_REPLACEMENT,
};
