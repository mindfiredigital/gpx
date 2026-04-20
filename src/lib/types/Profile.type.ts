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

export type { Profile, ProfilesStore };
