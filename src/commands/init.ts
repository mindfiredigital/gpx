import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printSuccess, printHuman, printJson } from '../utils/output';
import { getShellConfig } from '../utils/shell/getShell';
import type { InitArgs } from '../lib/types/InitCommand.type';
import { ProfileError } from '../core/profileManagement/errorClass';
import { getShellScripts } from '../utils/shell/getShellScripts';

export const runInitCommand = async (args: InitArgs): Promise<number> => {
  try {
    if (!args.shell) throw new ProfileError(`--shell required`, ExitCode.INVALID_INPUT);
    const { type, file } = getShellConfig(args.shell);

    const scriptStart = '# gpx init >>>';
    const scriptEnd = '# <<< gpx init';
    const { initScript, completionScript } = getShellScripts(type);
    const scriptBody = `${initScript}\n${completionScript}`;
    const scriptContent = `\n${scriptStart}\n${scriptBody}\n${scriptEnd}`;

    const shellConfigDir = path.dirname(file);
    if (!fs.existsSync(shellConfigDir)) fs.mkdirSync(shellConfigDir, { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, '', { encoding: 'utf-8' });

    if (type === 'bash') {
      const bashProfilePath = path.join(os.homedir(), '.bash_profile');
      const bashProfileContent = `\ntest -f ~/.bashrc && . ~/.bashrc`;
      if (!fs.existsSync(bashProfilePath)) {
        fs.writeFileSync(bashProfilePath, bashProfileContent, { encoding: 'utf-8' });
      } else {
        const currentBashProfileContent = fs.readFileSync(bashProfilePath, { encoding: 'utf-8' });
        if (!currentBashProfileContent.includes('.bashrc'))
          fs.appendFileSync(bashProfilePath, bashProfileContent, { encoding: 'utf-8' });
      }
    }

    const currentContent = fs.readFileSync(file, { encoding: 'utf-8' });

    if (currentContent.includes(scriptStart) && currentContent.includes(scriptEnd)) {
      const startIdx = currentContent.indexOf(scriptStart);
      const endIdx = currentContent.indexOf(scriptEnd) + scriptEnd.length;

      const newContent =
        currentContent.substring(0, startIdx) +
        scriptContent.trim() +
        currentContent.substring(endIdx);

      if (currentContent !== newContent) {
        fs.writeFileSync(file, newContent, { encoding: 'utf-8' });
        if (args.json) {
          printJson({ success: true, data: { type, file, updated: true } });
        } else {
          printSuccess(`\ngpx shell script updated for ${type} in ${file}`);
          printHuman(`Please restart your shell`);
        }
      } else {
        if (args.json) {
          printJson({ success: true, data: { type, file } });
        } else {
          printSuccess(`\ngpx already initialized and up to date in ${file}`);
        }
      }
      return ExitCode.SUCCESS;
    }

    fs.appendFileSync(file, scriptContent);

    if (args.json) {
      printJson({ success: true, data: { type, file } });
    } else {
      printSuccess(`\ngpx initialized for ${type} in ${file}`);
      printHuman(`Please restart your shell`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
