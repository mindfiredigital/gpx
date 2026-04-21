interface sshKeyValidationResult {
  exists: boolean;
  permissionOk: boolean;
}

interface GeneratedSshKey {
  privateKeyPath: string;
  publicKeyPath: string;
  publicKey: string;
}

export type { sshKeyValidationResult, GeneratedSshKey };
