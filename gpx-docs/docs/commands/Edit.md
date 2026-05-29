## Edit a profile

You can update any saved profile attribute using the edit command.

### Commands

#### Update Display Name and Email
```bash
gpx edit <profile_name> --display-name "New Display Name" --email "new@email.com"
```

#### Update GitHub Username (PAT profiles only)
```bash
gpx edit <profile_name> --github-username <username>
```

#### Update SSH Key
```bash
gpx edit <profile_name> --ssh-key <private_ssh_key_path>
```

#### Update GPG Key
```bash
gpx edit <profile_name> --gpg-key <new_gpg_key>
```

#### Enable / Disable signing
```bash
gpx edit <profile_name> --signing <true/false>
```

#### Multiple changes at once
```bash
gpx edit work --display-name "Ada Lovelace" --gpg-key <new_gpg_key> --signing true
```

#### **NOTE** - The unique profile name (e.g. `work` or `personal`) is the identifier and cannot be changed. All other parameters can be edited.