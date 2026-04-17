import fs from 'node:fs';

export const atomicWrite = (filePath: string, data: string): void => {
  const tempPath = filePath + '.temp';

  const fd = fs.openSync(tempPath, 'w');
  try {
    fs.writeFileSync(fd, data, { encoding: 'utf-8' });
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }

  fs.renameSync(tempPath, filePath);
};
