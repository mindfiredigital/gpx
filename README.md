# gpx

**Git Profile eXchanger** - switch between multiple Git identities instantly from the CLI.

As a **nvm but for git profiles**. One command to switch your name, email, and SSH key across projects.

--- 

## Installation
```bash
npm install -g @mindfiredigital/gpx
```

---

## Commands

### `gpx add <name>`
Add a new profile. Runs GitHub OAuth -> generates SSH key -> uploads to GitHub automatically.

```bash
gpx add work
gpx add work --ssh-key ~/.ssh/id_ed25519_work   # skip SSH generation, use existing key provided
```

### `gpx use <name>`
Switch the active Git identity globally, or just for the current repo.

```bash
gpx use work
gpx use personal --local   # local to current repo only
```

### `gpx current`
Show which profile is currently active.

```bash
gpx current
gpx current --json
```

### `gpx ls`
List all saved profiles.

```bash
gpx ls
gpx ls --json
```

### `gpx show <name>`
Show full details of a profile.

```bash
gpx show work
```

### `gpx edit <name>`
Edit an existing profile's SSH key, GPG key, or signing setting.

```bash
gpx edit work --ssh-key ~/.ssh/new_key
gpx edit work --gpg-key ABC123DEF456
gpx edit work --signing true
```

### `gpx remove <name>` / `gpx rm <name>`
Remove a profile. SSH keys are moved to `~/.ssh/gpx-removed/`, not deleted but stored safely.

```bash
gpx remove work
gpx rm work
gpx rm work --force   # to remove currently active profile
```

### `gpx run <name> -- <command>`
Run a single command temporarily under a different profile, then restore.

```bash
gpx run personal -- git commit -m "minor change"        # changes 3892 lines of code🫤
gpx run work -- git push origin main
```

### `gpx doctor [name]`
Diagnose profile and system health - checks Git, SSH key, SSH agent, GPG key.

```bash
gpx doctor
gpx doctor work
gpx doctor --json
```

### `gpx init`
Inject shell integration and prompt badge into your shell config.

```bash
gpx init --shell bash
gpx init --shell zsh
gpx init --shell powershell
```

After running, your prompt shows the active profile:
```
[work] ~/projects/company-app $
```

### `gpx completion`
Print shell completion script.

```bash
gpx completion --shell bash
gpx completion --shell zsh
```

### `gpx config`
Get or set gpx configuration values.

```bash
gpx config set auto-detect true
gpx config get auto-detect
```

### `gpx export`
Export all profiles to JSON.

```bash
gpx export
gpx export -o my-profiles.json
```

### `gpx import <filepath>`
Import profiles from a JSON file.

```bash
gpx import my-profiles.json
```

---

## Global Flags

Available on every command:

| Flag | Description |
|---|---|
| `--json` | Structured JSON output |
| `--no-interactive` | Disable prompts - for scripts and agents |
| `--no-color` | Disable ANSI colors |
| `--quiet` | Suppress all output except errors |
| `--debug` | Show debug logs |

---

## Data Storage

```
~/.gpx/
├── profiles.json        # All profile definitions
├── active.json          # Currently active global profile
├── config.json          # gpx settings (auto-detect, etc.)
└── backups/             # Timestamped backups before writes

~/.config/gpx/
└── config.json          # GitHub OAuth tokens (keyed by GitHub username)

~/.ssh/
├── id_ed25519_gpx_work      # Generated private key (eg. 'work' profile)
├── id_ed25519_gpx_work.pub  # Generated public key (eg. 'work' profile)
├── config                   # Contains gpx-managed blocks
└── gpx-removed/             # SSH keys from removed profiles (not deleted)
```

gpx manages `~/.gitconfig` and `~/.ssh/config` safely - it only ever touches its own clearly-marked blocks and uses atomic writes throughout.

---

## Local Development

```bash
bun install
bun run dev             # run CLI locally
bun run build           # compile to dist/
bun run test            # run all tests
bun run test:coverage   # get test coverage
bun run lint            # check for linting errors
bun run format          # format using prettier
```