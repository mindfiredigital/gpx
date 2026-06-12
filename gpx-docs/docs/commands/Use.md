# Switch Profile

Switch your active Git identity globally, or locally for the current repository only.

## Usage

```bash
gpx use <profile_name>
```

<video style={{ maxWidth: '800px', width: '50%', display: 'block', borderRadius: '4px', margin: '0 auto' }} autoPlay loop muted playsInline controls>
  <source src={require('@site/static/img/gpx-switch-profiles.mp4').default} type="video/mp4" />
</video>

## Options

| Option | Description |
|--------|-------------|
| `--local` | Switch profile for the current Git repository |
| `--json` | Return structured JSON output |

## Examples

### Switch global active profile

This sets the profile for all repositories on your system (unless they have a local override).

```bash
gpx use work
```

Expected output:
```
Switched to work (global)
```

### Switch locally (current repo only)

This sets the profile for the current repository only.

```bash
gpx use freelance --local
```

Expected output:
```
Switched to freelance (local)
```

:::tip[NOTE]
If the repository does not have a commit guard set up, you'll see a helpful tip after switching locally: <br/>
`💡 Tip: To prevent accidental commits, run 'gpx guard'`<br/>
This tip disappears once you run `gpx guard` to protect the repository.
:::

## What happens behind the scenes

When you run `gpx use`:
1. **Global switch:** gpx sets your `user.name` and `user.email` in `~/.gitconfig`. It also updates `~/.gpx/active.json`.
2. **Local switch (`--local`):** gpx sets your `user.name` and `user.email` in the repository's `.git/config`.
3. **GPG Signing:** If the profile has a GPG key, it sets `user.signingkey` and `commit.gpgsign=true`. If not, it disables signing.
4. **Remote rewriting:** If you switch profiles inside a repository that uses SSH, gpx will rewrite the `origin` remote URL (e.g., from `github.com-old` to `github.com-new`) so that subsequent fetch/push operations use the correct SSH key.

## Related commands

- [`gpx guard`](./Guard.md) - Lock a repository to prevent commits from the wrong profile.
- [`gpx current`](./Current.md) - See which profile is currently active.
- [`gpx run`](./Run.md) - Temporarily run a command under a different profile without switching.