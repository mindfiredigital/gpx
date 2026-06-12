# Temporary Profile Switch

Run a single command temporarily under a different profile without changing your active profile.

## Usage

```bash
gpx run <profile_name> <command>
```

## Options

| Option | Description |
|--------|-------------|
| `--json` | Return structured JSON output |

## Examples

### Temporary push under work profile
```bash
gpx run work git push origin main
```

Expected output:
```
Command executed as work
```

### Temporary commit under personal profile
```bash
gpx run personal git commit -m "fix: minor bug"
```

Expected output (JSON):
```bash
gpx run personal git commit -m "fix: minor bug" --json
```

```json
{
  "success": true,
  "data": {
    "profile": "personal",
    "command": "git commit -m fix: minor bug",
    "exit_code": 0
  }
}
```

## What happens behind the scenes

When you use `gpx run`:
1. gpx temporarily sets Git environment variables : `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_SSH_COMMAND`.
2. It executes the specified command with those variables injected.
3. For PAT profiles, it temporarily registers the credential helper globally and restores it when the command finishes.
4. Your current active profile remains completely unchanged.

## Related commands

- [`gpx use`](./Use.md) - Switch your profile globally or locally instead of temporarily.
- [`gpx current`](./Current.md) - Check which profile is currently active.
