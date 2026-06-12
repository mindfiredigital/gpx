# List Profiles

List all your saved Git profiles.

## Usage

```bash
gpx ls
```

![List of profiles](/img/gpx-ls.png)

## Options

| Option | Description |
|--------|-------------|
| `--json` | Return structured JSON output |

## Examples

### Show all profiles

```bash
gpx ls
```

Expected output:
```
  work         Ada Lovelace <ada@company.com>          [ssh]
* personal     Alan Turing <alan@gmail.com>             [ssh]
  freelance    Ada Freelance <ada@clientco.com>         [pat]
```

:::note[NOTE]
> The profile with the asterisk (`*`) is your currently active **global** profile.
:::

### Structured JSON output

```bash
gpx ls --json
```

Expected output:
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "name": "work",
        "display_name": "Ada Lovelace",
        "email": "ada@company.com",
        "auth_method": "ssh"
      },
      {
        "name": "personal",
        "display_name": "Alan Turing",
        "email": "alan@gmail.com",
        "auth_method": "ssh"
      }
    ],
    "active": "personal"
  }
}
```

## What happens behind the scenes

gpx reads the available profiles from `~/.gpx/profiles.json` and checks `~/.gpx/active.json` to determine which one receives the active marker.

## Related commands

- [`gpx show`](./Show.md) - See the full configuration details of a specific profile.
- [`gpx add`](./Add.md) - Add a new profile to the list.