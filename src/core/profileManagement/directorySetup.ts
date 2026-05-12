import fs from 'fs';
import { GPX_DIR } from '../../lib/constants';

// Directory setup
export const ensureGpxDir = (): void => {
  if (!fs.existsSync(GPX_DIR)) {
    fs.mkdirSync(GPX_DIR, {
      recursive: true,
    });
  }
};
