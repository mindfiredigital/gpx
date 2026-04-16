interface Profile {
  name: string;
  display_name: string;
  email: string;
  ssh_key?: string;
  gpg_key?: string;
  host_pattern?: string;
  default_branch?: string;
  signing_commits?: boolean;
  created_at: string;
  last_used_at?: string;
}

interface ProfilesStore {
  version: number;
  profiles: Profile[];
}

interface ActiveStore {
  global: string | null;
  switched_at: string | null;
}

interface GpxConfig {
  auto_detect: boolean;
  auto_detect_notify: boolean;
  default_shell?: string;
}

interface JsonOutput<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: number; message: string };
}

export type { Profile, ProfilesStore, ActiveStore, GpxConfig, JsonOutput };
