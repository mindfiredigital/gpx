# Add Profile

Create a new profile with either SSH or PAT (HTTPS) authentication.

## Usage

```bash
gpx add <profile_name>
```

![Adding a new profile interactively](/img/gpx-add-interactive.png)

## Options

| Option | Description |
|--------|-------------|
| `--auth-method [ssh/pat]` | The authentication method to use for this profile |
| `--display-name [name]` | The name that will appear on your Git commits |
| `--email [email]` | The email that will appear on your Git commits |
| `--ssh-key [path]` | Path to an existing SSH private key to use |
| `--generate-ssh` | Automatically generate a new SSH key pair for this profile |
| `--pat [token]` | Provide a Personal Access Token (PAT) securely |
| `--gpg-key [key]` | GPG key ID for signing commits |
| `--signing` | Enable GPG commit signing |
| `--no-interactive` | Disable prompts (useful for scripts and CI) |

## Examples

### Interactive Mode

The easiest way to add a profile is interactively. gpx will prompt you to select an authentication method, enter your name and email, and either generate an SSH key, select an existing one, or enter a PAT.

```bash
gpx add work
```

### Non-Interactive SSH Profile (Generate new key)

```bash
gpx add work \
  --auth-method ssh \
  --display-name "Ada Lovelace" \
  --email "ada@company.com" \
  --generate-ssh \
  --no-interactive
```

### Non-Interactive SSH Profile (Use existing key)

```bash
gpx add personal \
  --auth-method ssh \
  --display-name "Alan Turing" \
  --email "alan@gmail.com" \
  --ssh-key ~/.ssh/id_ed25519_personal \
  --gpg-key ABC123DEF456 \
  --signing \
  --no-interactive
```

### Non-Interactive PAT Profile


```bash
gpx add freelance \
  --auth-method pat \
  --display-name "Ada Freelance" \
  --email "ada@clientco.com" \
  --pat "github_pat_11ABC..." \
  --no-interactive
```

## What happens behind the scenes

When you add a new profile:
1. **For SSH profiles:** gpx registers the new identity. If you chose to generate an SSH key, it creates an `id_ed25519` key pair. It then creates a dedicated `Host` block in `~/.ssh/config` so SSH automatically knows to use this key when cloning via the gpx host alias.
2. **For PAT profiles:** gpx validates your PAT against the GitHub API, retrieves your GitHub username, and securely stores the PAT in your OS native credential manager.
3. The profile details are saved to `~/.gpx/profiles.json`.

## Related commands

- [`gpx ls`](./Ls.md) - List all saved profiles.
- [`gpx edit`](./Edit.md) - Edit the details of an existing profile.
- [`gpx remove`](./Remove.md) - Delete a profile.