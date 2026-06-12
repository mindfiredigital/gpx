# Remove Profile

Delete a profile from gpx.

:::tip[TIP]
> You can also use `gpx rm <profile_name>` as a shortcut for this command.
:::

## Usage

```bash
gpx remove <profile_name>
```

## Options

| Option | Description |
|--------|-------------|
| `--force` | Force removal even if the profile is currently active |

## Examples

### Remove a non-active profile

```bash
gpx remove personal
```

Expected output:
```
Profile 'personal' removed successfully.
```

### Try to remove the active profile

By default, gpx prevents you from deleting the profile that is currently active.

```bash
gpx remove work
```

Expected output:
```
cannot remove active profile. Use --force
```

### Force remove the active profile

```bash
gpx remove work --force
```

## What happens behind the scenes

When you remove a profile:
1. It is deleted from `~/.gpx/profiles.json`.
2. **For SSH profiles:** The SSH key is **not** deleted. To prevent accidental data loss, gpx moves the key pair to `~/.ssh/gpx-removed/` so you can recover it later if needed. The profile's `Host` block is removed from `~/.ssh/config`.
3. **For PAT profiles:** The Personal Access Token is securely deleted from your operating system's keychain.

## Related commands

- [`gpx ls`](./Ls.md) - List remaining profiles.
- [`gpx add`](./Add.md) - Add a new profile.