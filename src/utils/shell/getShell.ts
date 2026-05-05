import os from 'node:os';
import path from 'node:path';
import type { ShellType, GetShellConfig } from '../../lib/types/ShellConfig.type';

export const getShellConfig = (shell: ShellType): GetShellConfig => {
  if (shell.includes('zsh')) return { type: 'zsh', file: path.join(os.homedir(), '.zshrc') };
  if (shell.includes('bash')) return { type: 'bash', file: path.join(os.homedir(), '.bashrc') };
  if (shell.includes('powershell'))
    return {
      type: 'powershell',
      file: path.join(
        os.homedir(),
        'OneDrive',
        'Documents',
        'WindowsPowerShell',
        'Microsoft.PowerShell_profile.ps1'
      ),
    };

  return { type: '', file: '' };
};
