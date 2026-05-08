import path from 'node:path';
import fs from 'node:fs';
import { SSH_DIR } from '../lib/constants';

export const moveSshKeysToRemoved = (sshKeyPath: string): void => {
  const removedDir = path.join(SSH_DIR, 'gpx-removed');

  if (!fs.existsSync(removedDir)) {
    fs.mkdirSync(removedDir, { recursive: true });
  }

  const privateKeyPath = sshKeyPath;
  const publicKeyPath = `${sshKeyPath}.pub`;

  if (fs.existsSync(privateKeyPath)) {
    const movePrivateKey = path.join(removedDir, path.basename(privateKeyPath));
    fs.renameSync(privateKeyPath, movePrivateKey);
  }

  if (fs.existsSync(publicKeyPath)) {
    const movePublicKey = path.join(removedDir, path.basename(publicKeyPath));
    fs.renameSync(publicKeyPath, movePublicKey);
  }
};
