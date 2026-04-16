import os from 'node:os';
import path from 'node:path';

// Exit codes
enum ExitCode {
  SUCCESS = 0,
  PROFILE_NOT_FOUND = 1,
  SSH_KEY_MISSING = 2,
  GIT_NOT_INSTALLED = 3,
  NOT_A_GIT_REPO = 4,
  PERMISSION_ERROR = 5,
  INVALID_INPUT = 6,
  PROFILE_ALREADY_EXISTS = 7,
}

// Path constants
const HOME_DIR: string = os.homedir();
const GPX_DIR: string = path.join(HOME_DIR, '.gpx');
const BACKUP_DIR = path.join(GPX_DIR, 'backups');
const PROFILES_PATH: string = path.join(GPX_DIR, 'profiles.json');
const ACTIVE_PATH: string = path.join(GPX_DIR, 'active.json');
const LOCK_PATH: string = path.join(GPX_DIR, '.lock');

export { ExitCode, HOME_DIR, GPX_DIR, BACKUP_DIR, PROFILES_PATH, ACTIVE_PATH, LOCK_PATH };
