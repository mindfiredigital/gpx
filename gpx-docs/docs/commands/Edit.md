# Edit Profile

Update attributes of an existing profile.

## Usage

```bash
gpx edit <profile_name> [options]
```

## Options

| Option | Description |
|--------|-------------|
| `--display-name [name]` | The name that will appear on your Git commits |
| `--email [email]` | The email that will appear on your Git commits |
| `--github-username [name]` | (PAT profiles only) The associated GitHub username |
| `--ssh-key [path]` | Path to an existing SSH private key to use |
| `--gpg-key [key]` | GPG key ID for signing commits |
| `--signing [true/false]` | Enable or disable GPG commit signing |

## Examples

### Update Display Name and Email

```bash
gpx edit work --display-name "New Display Name" --email "new@email.com"
```

### Update GitHub Username

This applies only to profiles using Personal Access Token (PAT) authentication.

```bash
gpx edit freelance --github-username "new-username"
```

### Update SSH Key

Change the SSH key associated with an SSH-based profile.

```bash
gpx edit work --ssh-key ~/.ssh/new_key
```

### Update GPG Key and enable signing

Provide a new GPG key ID and enable commit signing in a single command.

```bash
gpx edit work --gpg-key ABC123DEF456 --signing true
```

### Disable commit signing

```bash
gpx edit work --signing false
```

:::warning[WARN]
> The unique profile name (e.g., `work` or `personal`) serves as the permanent identifier and **cannot** be changed. <br/>
> If you need a new name, you must add a new profile and remove the old one.
:::

## What happens behind the scenes

When you edit a profile, gpx updates the metadata stored in `~/.gpx/profiles.json`. 

Additionally:
- If you edit the **currently active profile**, gpx instantly re-applies the global configuration to `~/.gitconfig` so your changes take effect immediately.
- If you edit the SSH key path, gpx automatically updates the corresponding `Host` block in `~/.ssh/config` to point to the new private key.

## Related commands

- [`gpx add`](./Add.md) - Create a new profile.
- [`gpx show`](./Show.md) - View the current details of a profile before editing.