# Active Profile

Check which Git profile is currently active.

## Usage

```bash
gpx current
```

![Active profile with local override](/img/gpx-current-local.png)

## Options

| Option | Description |
|--------|-------------|
| `--json` | Return structured JSON output |

## Examples

### Display active profile (Global only)

When only a global profile is active:

```bash
gpx current
```

Expected output:
```
Active profile: work
  Name:   Ada Lovelace
  Email:  ada@company.com
  Scope:  global
```

### Display active profile (Local override)

When a local profile is set inside a repository:

```bash
gpx current
```

Expected output:
```
Active profile: freelance (local override)
  Name:   A. Lovelace
  Email:  ada@clientco.com
  Scope:  local (~/projects/client-app)
  Global: work (Ada Lovelace <ada@company.com>)
```

### Display active profile (With Commit Guard)

If the repository has been guarded with `gpx guard`:

```bash
gpx current
```

Expected output:
```
Active profile: work (local override)
  Name:   Ada Lovelace
  Email:  ada@company.com
  Scope:  local (~/projects/company-app)
  Global: work (Ada Lovelace <ada@company.com>)

Commit Guard: Enabled ✓ (Locked to: 'work')
```

### Structured JSON Output

```bash
gpx current --json
```

Expected output:
```json
{
  "success": true,
  "data": {
    "active": {
      "profile": "work",
      "scope": "local",
      "auth_method": "ssh"
    },
    "global": {
      "profile": "personal",
      "name": "Alan Turing",
      "email": "alan@gmail.com",
      "signingKey": null
    },
    "local": {
      "profile": "work",
      "name": "Ada Lovelace",
      "email": "ada@company.com",
      "signingKey": null
    },
    "guard_status": "pass",
    "guard_message": "Enabled ✓ (Locked to: 'work')"
  }
}
```

:::note[NOTE]
> `guard_status` can be `"pass"`, `"warn"`, or `"fail"`. `"fail"` occurs when the `pre-commit` hook is installed, but the repository is missing the `gpx.expectedprofile` configuration (meaning you should run `gpx guard` again).
:::

## What happens behind the scenes

gpx checks your current context by:
1. Reading `.git/config` (if inside a repository) to see if a local identity is set that matches a gpx profile.
2. Reading `~/.gpx/active.json` to check the global fallback profile.
3. Checking the repository's `.git/hooks/pre-commit` script to see if the Commit Guard is active.

## Related commands

- [`gpx use`](./Use.md) - Change the active profile.
- [`gpx guard`](./Guard.md) - Lock a repository to a specific profile.