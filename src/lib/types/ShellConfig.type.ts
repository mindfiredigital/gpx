type ShellType = 'bash' | 'zsh' | 'powershell';

interface GetShellConfig {
  type: string;
  file: string;
}

interface ShellScript {
  initScript: string;
  completionScript: string;
}

export type { ShellType, GetShellConfig, ShellScript };
