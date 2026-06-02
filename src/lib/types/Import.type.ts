export interface Profile {
  name: string;
  display_name: string;
  email: string;
  ssh_key?: string;
  signing_commits: boolean;
  created_at: string;
  ssh_public_key?: string;
  gpg_key?: string;
  last_used_at?: string;
}

interface JsonImport {
  success: boolean;
  data: {
    profiles: Profile[];
    exported_at: string;
  };
}

interface NonJsonImport {
  profiles: Profile[];
}

export type ImportData = JsonImport | NonJsonImport;
