# Export Profiles

Export all your saved profiles to a JSON file. This is highly recommended when setting up a new machine or backing up your configuration.

## Usage

```bash
gpx export
```

## Options

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Path to save the JSON export file |
| `--include-public-keys` | Include the content of your SSH public keys in the export |
| `--json` | Return structured JSON output to the terminal instead of writing a file |

## Examples

### Export to a file

```bash
gpx export -o my-profiles.json
```

### Export with public keys included

If you plan to import these profiles on a machine that already has the private keys, including the public key content is useful.

```bash
gpx export --include-public-keys -o backup.json
```

### JSON Format Structure

If you inspect the exported file, or run with `--json`, the structure looks like this:

```json
{
  "profiles": [
    {
      "name": "work",
      "display_name": "Ada Lovelace",
      "email": "ada@company.com",
      "ssh_key": "~/.ssh/id_ed25519_gpx_work",
      "gpg_key": null,
      "signing_commits": false,
      "auth_method": "ssh",
      "created_at": "2024-03-12T10:00:00.000Z"
    }
  ],
  "exported_at": "2024-03-14T15:30:00.000Z"
}
```

:::warning[WARNING]
> **Security:** For security reasons, `gpx export` **does not** export your Personal Access Tokens (PATs) or private SSH keys. <br/> 
> When you import profiles on a new machine, you must copy your SSH keys manually, and <br/> run `gpx pat set <profile>` to re-enter your PATs.
:::

## What happens behind the scenes

gpx reads your `~/.gpx/profiles.json` and packages it into a portable format. If `--include-public-keys` is used, it reads the `.pub` file corresponding to your `ssh_key` path and embeds it in the JSON.

## Related commands

- [`gpx import`](./Import.md) - Import profiles from a JSON file.