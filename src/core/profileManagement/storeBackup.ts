import fs from 'node:fs';
import path from 'node:path';
import { BACKUP_DIR } from '../../lib/constants';

// Backup
export const backupFile = (filePath: string, label: string): void => {
  if (!fs.existsSync(filePath)) return;

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }

  const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = path.basename(filePath);
  const backupPath = path.join(BACKUP_DIR, `${fileName}.${label}.${timeStamp}`);

  fs.copyFileSync(filePath, backupPath);
};
