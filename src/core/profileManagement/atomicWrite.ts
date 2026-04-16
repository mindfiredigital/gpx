import fs from 'node:fs';

export const atomicWrite = (filePath: string, data: string): void => {
  const tempPath = filePath + '.temp';
  fs.writeFileSync(tempPath, data, 'utf-8');
  fs.renameSync(tempPath, filePath);
};
