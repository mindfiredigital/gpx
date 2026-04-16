import fs from 'node:fs';
import { ensureGpxDir } from './directorySetup';
import { ProfileError } from './errorClass';
import { LOCK_PATH, ExitCode } from '../../lib/constants';

// File locking
export const withLock = async <T>(fn: () => T | Promise<T>): Promise<T> => {
  ensureGpxDir();

  if (fs.existsSync(LOCK_PATH)) {
    throw new ProfileError('another process is running', ExitCode.PERMISSION_ERROR);
  }

  try {
    fs.writeFileSync(LOCK_PATH, process.pid.toString());

    const result = await fn();
    return result;
  } finally {
    if (fs.existsSync(LOCK_PATH)) {
      fs.unlinkSync(LOCK_PATH);
    }
  }
};
