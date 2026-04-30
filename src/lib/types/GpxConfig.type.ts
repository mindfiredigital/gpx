interface GpxConfig {
  auto_detect: boolean;
  auto_detect_notify: boolean;
  default_shell?: string;
}

type GlobalCliOptions = {
  json?: boolean;
  noInteractive?: boolean;
  noColor?: boolean;
  quiet?: boolean;
};

type GitScope = 'global' | 'local';

type GitIdentity = {
  name: string | null;
  email: string | null;
  signingKey: string | null;
};

interface GithubPersonalAccessToken {
  github_tokens?: Record<string, string>;
}

export type { GpxConfig, GlobalCliOptions, GitScope, GitIdentity, GithubPersonalAccessToken };
