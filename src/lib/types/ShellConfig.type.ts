type ShellType = 'bash' | 'zsh' | 'fish';

interface GetShellConfig {
  type: string;
  file: string;
}

export type { ShellType, GetShellConfig };
