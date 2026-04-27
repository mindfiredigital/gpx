import os from 'node:os';
import path from 'node:path';
import type { ShellType, GetShellConfig } from '../../lib/types/ShellConfig.type';

export const getShellConfig = (shell?: ShellType): GetShellConfig => {
  const shellPath = shell || process.env.SHELL || '';

  if (shellPath.includes('zsh')) return { type: 'zsh', file: path.join(os.homedir(), '.zshrc') };
  if (shellPath.includes('fish'))
    return { type: 'fish', file: path.join(os.homedir(), '.config/fish/config.fish') };

  return { type: 'bash', file: path.join(os.homedir(), '.bashrc') };
};
