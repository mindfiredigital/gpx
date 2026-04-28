type ShellType = 'bash' | 'zsh';

interface GetShellConfig {
  type: string;
  file: string;
}

interface ShellScript {
  initScript: string;
  completionScript: string;
}

export type { ShellType, GetShellConfig, ShellScript };
