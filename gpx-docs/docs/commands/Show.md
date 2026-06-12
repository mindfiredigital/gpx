# Profile Detail

Display the full details of a specific saved profile.

## Usage

```bash
gpx show <profile_name>
```

## Options

| Option | Description |
|--------|-------------|
| `--json` | Return structured JSON output |

## Examples

### Display profile details

```bash
gpx show work
```

Expected output:
```
Profile: work
Display name: Ada Lovelace
Email: ada@company.com
Auth Method: ssh
SSH key: ~/.ssh/id_ed25519_gpx_work
GPG key: not set
Signing commits: disabled
Created at: 3/14/2024, 10:00:00 AM
Last used at: 4/01/2024, 2:30:00 PM
Active: yes
```

### Structured JSON output

```bash
gpx show work --json
```

Expected output:
```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "work",
      "display_name": "Ada Lovelace",
      "email": "ada@company.com",
      "auth_method": "ssh",
      "ssh_key": "~/.ssh/id_ed25519_gpx_work",
      "gpg_key": null,
      "signing_commits": false,
      "github_username": "ada-lovelace",
      "created_at": "2024-03-14T10:00:00.000Z",
      "last_used_at": "2024-04-01T14:30:00.000Z"
    },
    "active": true
  }
}
```

## What happens behind the scenes

gpx simply reads the profile configuration from `~/.gpx/profiles.json` and `~/.gpx/active.json` to format the display.

## Related commands

- [`gpx ls`](./Ls.md) - List all saved profiles.
- [`gpx edit`](./Edit.md) - Edit the details of this profile.