export interface AddArgs {
  name: string;
  displayName?: string;
  email?: string;
  pat?: string;
  sshKey?: string;
  generateSsh?: boolean;
  gpgKey?: string;
  signing?: boolean;
  authMethod: 'ssh' | 'pat';
  noInteractive?: boolean;
  json?: boolean;
}
