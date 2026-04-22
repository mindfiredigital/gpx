export interface AddArgs {
  name: string;
  displayName?: string;
  email?: string;
  sshKey?: string;
  generateSsh?: boolean;
  gpgKey?: string;
  signing?: boolean;
  noInteractive?: boolean;
  json?: boolean;
}
