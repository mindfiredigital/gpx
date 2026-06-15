## Manage PAT for a profile

Use the `pat` command to manage Personal Access Tokens (PAT) securely stored in your operating system's keychain.

#### **NOTE** :
- PAT (HTTPS) authentication is supported on `macOS` and `Linux`. 
- Support for `Windows` would be available soon.

### Set a PAT

You can set a PAT token interactively or pass it directly via a flag.

#### Interactive Setup
```bash
gpx pat set <profile_name>
```
*Prompts you to securely enter your Personal Access Token.*

#### Non-interactive Setup
```bash
gpx pat set <profile_name> --pat <your_token_here>
```

### Clear a Stored PAT

To securely remove a stored PAT from your operating system keychain:

```bash
gpx pat clear <profile_name>
```
