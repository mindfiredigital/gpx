# gpx

Git Profile eXchanger (`gpx`) helps you switch Git identities quickly from the CLI.

## Implemented

- Add profile: `gpx add <name>`
- List profiles: `gpx ls`
- Show profile details: `gpx show <name>`
- Switch profile globally: `gpx use <name>`
- Show active profile info: `gpx current`
- Remove profile: `gpx remove <name>` / `gpx rm <name>`

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
gpx add work --display-name "Alan Turing" --email "alan@gmail.com"
gpx ls
gpx use work
gpx current
gpx show work
gpx remove personal
gpx rm personal
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

`gpx` stores its state under `~/.gpx`:

- `profiles.json`
- `active.json`
- `config.json`
