# Import Profiles

Import profiles from a JSON file into gpx. Useful when moving to a new machine or restoring from a backup.

## Usage

```bash
gpx import <filepath>
```

## Options

| Option | Description |
|--------|-------------|
| `--merge` | Merge with existing profiles instead of overwriting them |
| `--json` | Return structured JSON output |

## Examples

### Basic import

By default, importing will overwrite any existing profiles with the same name.

```bash
gpx import profiles.json
```

### Import from a specific path

```bash
gpx import ~/backups/my-profiles.json
```

### Import and view result as JSON

```bash
gpx import profiles.json --json
```

### What a valid import file looks like

A valid import file matches the format produced by `gpx export`:

```json
{
  "profiles": [
    {
      "name": "work",
      "display_name": "Ada Lovelace",
      "email": "ada@company.com",
      "auth_method": "ssh",
      "ssh_key": "~/.ssh/id_ed25519_gpx_work",
      "github_username": "ada-lovelace"
    },
    {
      "name": "freelance",
      "display_name": "Ada Freelance",
      "email": "ada@clientco.com",
      "auth_method": "pat",
      "github_username": "ada-freelance"
    }
  ],
  "exported_at": "2024-03-14T15:30:00.000Z"
}
```

:::note[NOTE] 
> SSH key paths are imported as-is. Make sure the key files exist at those paths on the new machine, or run <br/> 
`gpx edit <name> --ssh-key <new_path>` to update them after import.
:::

## Typical workflow - moving to a new machine

**On the old machine:**
```bash
gpx export -o profiles.json
```

**On the new machine:**
```bash
gpx import profiles.json
gpx ls   # verify profiles were imported
```

:::warning[WARNING]
> PAT tokens are **not** included in exports for security reasons. After importing PAT profiles, you must re-set the token by running `gpx pat set <profile_name>`.
:::

## Related commands

- [`gpx export`](./Export.md) - Export your profiles to a JSON file.