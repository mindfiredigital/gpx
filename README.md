# gpx

Git Profile eXchanger (`gpx`) helps you switch Git identities quickly from the CLI.

## Implemented

- Add profile & generate SSH key: `gpx add <name> --generate-ssh`
- List profiles: `gpx ls`
- Show profile details: `gpx show <name>`
- Switch profile globally: `gpx use <name>`
- Show active profile info: `gpx current`
- Remove profile: `gpx remove <name>` / `gpx rm <name>`
- Inject current profile & enable command + profile completion feature: `gpx init --shell <shell_name>`

## Local Setup

```bash
bun install
```

## Run the CLI

```bash
gpx --help
```

Examples:

```bash
gpx add work --display-name "Alan Turing" --email "alan@gmail.com" --generate-ssh
gpx ls
gpx use work
gpx current
gpx show work
gpx remove personal
gpx rm personal
gpx init --shell <shell_name>  --> Bash / Zsh
```

## Global Flags

The following flags are available for current commands:

- `--json` structured JSON output
- `--no-color` disable ANSI colors
- `--quiet` suppress non-error output
- `--debug` show debug logs

## Development Commands

```bash
bun run test
bun run test:coverage
bun run build
bun run lint
```

## Data Files

### `gpx` stores its state under `~/.gpx`:

- `profiles.json`
- `active.json`
- `config.json`

### `SSH` keys are stored under `~/.ssh`
- `~/.ssh/.config` --> includes profile configs + SSH key paths (not key content)

### Backups are stored in `~/.gpx/backups` before write operations.