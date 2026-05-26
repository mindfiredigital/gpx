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
const SSH_DIR: string = path.join(os.homedir(), '.ssh');
const SSH_CONFIG_PATH: string = path.join(SSH_DIR, 'config');
const PROFILES_PATH: string = path.join(GPX_DIR, 'profiles.json');
const ACTIVE_PATH: string = path.join(GPX_DIR, 'active.json');
const CONFIG_PATH: string = path.join(GPX_DIR, 'config.json');
const LOCK_PATH: string = path.join(GPX_DIR, '.lock');
const CONFIG_DIR: string = path.join(os.homedir(), '.config', 'gpx');
const CONFIG_FILE: string = path.join(CONFIG_DIR, 'config.json');

// Device Flow - add + authenticate profile
const CLIENT_ID = '';
const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const API_BASE = 'https://api.github.com';


const PLATFORM = os.platform();
const SERVICE = 'gpx';

export {
  ExitCode,
  HOME_DIR,
  GPX_DIR,
  BACKUP_DIR,
  SSH_DIR,
  SSH_CONFIG_PATH,
  PROFILES_PATH,
  ACTIVE_PATH,
  CONFIG_PATH,
  LOCK_PATH,
  CLIENT_ID,
  DEVICE_CODE_URL,
  TOKEN_URL,
  API_BASE,
  CONFIG_DIR,
  CONFIG_FILE,
  PLATFORM,
  SERVICE
};
