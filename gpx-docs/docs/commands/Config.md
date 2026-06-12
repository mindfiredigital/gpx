# Manage Auto-Detect

Manage gpx configuration settings, such as enabling or disabling the auto-detect feature.

## Usage

```bash
gpx config <get|set> <key> [value]
```

## Available Keys

| Key | Description | Default |
|-----|-------------|---------|
| `auto-detect` | Automatically switch local profile when entering a repo | `false` |

## Examples

### Check a setting

```bash
gpx config get auto-detect
```

Expected output:
```
auto_detect = false
```

### Change a setting

```bash
gpx config set auto-detect true
```

## How Auto-Detect Works

When `auto-detect` is enabled, gpx automatically switches your **local** profile whenever you `cd` into a repository that uses a gpx SSH host alias (e.g., `github.com-work`) in its remote URL.

### Setup

1. Enable auto-detect:
   ```bash
   gpx config set auto-detect true
   ```
2. Initialize shell hooks (if not already done):
   ```bash
   gpx init --shell zsh
   ```

### What happens behind the scenes

When you move into a repository:
```bash
cd ~/work/company-repo
```

The shell hook fires and does the following:
1. Checks the repo's remote URL (e.g., `git@github.com-work:org/repo.git`).
2. Extracts the profile name ("work") from the SSH host alias.
3. Automatically sets the local profile to `work` (equivalent to running `gpx use work --local`).
4. Updates the terminal prompt badge.

:::note[NOTE]
> Auto-detect only changes the **local** profile for the current repository. Your global profile remains unchanged.
:::

### Auto-detect and Commit Guard

Auto-detect and [Commit Guard](./Guard.md) are designed to work perfectly together:

- **Auto-detect ON:** The correct local profile is set automatically when you enter a repo. The Commit Guard silently verifies the match and lets your commits through.
- **Auto-detect OFF:** You must manually switch profiles with `gpx use <name> --local`. If you forget, the Commit Guard catches the mismatch and blocks the commit, keeping your repository safe.

## Related commands

- [`gpx init`](./Init.md) - Install the shell hooks required for auto-detect to work.
