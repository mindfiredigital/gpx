# Pat Management

Manage Personal Access Tokens (PAT) securely stored in your operating system's keychain.

## Usage

```bash
gpx pat <subcommand> <profile_name>
```

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `set` | Interactively set or rotate a PAT for a profile |
| `clear` | Securely remove a stored PAT from your operating system keychain |

## Options

| Option | Description |
|--------|-------------|
| `--pat <token>` | Pass the token directly to bypass interactive prompts |

## Examples

### Set a PAT interactively

You can set a PAT token interactively. gpx will prompt you to securely enter your Personal Access Token.

```bash
gpx pat set freelance
```

### Set a PAT non-interactively

```bash
gpx pat set freelance --pat "github_pat_11ABC..."
```

### Clear a stored PAT

To securely remove a stored PAT from your operating system credential manager:

```bash
gpx pat clear freelance
```

## What happens behind the scenes

When you set a PAT, gpx validates it against the GitHub API. If valid, it stores it securely using:
- **macOS:** Keychain Access (`security` CLI)
- **Linux:** Secret Service API / GNOME Keyring (`secret-tool`)

When you clear a PAT, gpx asks the respective OS credential manager to delete the secret permanently.

## Related commands

- [`gpx add`](./Add.md) - Create a new profile (including PAT profiles).
- [`gpx doctor`](./Doctor.md) - Diagnose if your PAT authentication is working properly.
