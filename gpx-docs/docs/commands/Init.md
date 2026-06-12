# Initialize gpx shell-scripts

Inject shell integration to display your active profile in the terminal prompt and enable auto-detect hooks.

## Usage

```bash
gpx init --shell <shell_name>
```

![Terminal prompt badge](/img/gpx-prompt-badge.png)

## Options

| Option | Description |
|--------|-------------|
| `--shell [bash/zsh/powershell]` | The shell configuration file to modify |

## Examples

### Initialize for Zsh

```bash
gpx init --shell zsh
```

Restart your shell to apply the changes, or run:
```bash
source ~/.zshrc
```

### Initialize for Bash

```bash
gpx init --shell bash
```

Restart your shell to apply the changes, or run:
```bash
source ~/.bashrc
```

### Initialize for PowerShell

```powershell
gpx init --shell powershell
```

Restart your shell to apply the changes, or run:
```powershell
. $PROFILE
```

## What happens behind the scenes

Running `gpx init` safely modifies your shell's configuration file (e.g., `~/.zshrc`, `~/.bashrc`, or `$PROFILE`) by appending a self-contained script block. 

This script block adds two features:
1. **Prompt Badge:** It modifies your `PS1` (or equivalent prompt string) to display the active gpx profile name in brackets, e.g., `[work] ~/projects $`.
2. **Directory Hook:** It creates a hook that runs every time you change directories (`cd`). This hook calls `gpx autodetect` to seamlessly switch your local profile if [auto-detect](./Config.md) is enabled in your configuration.

### Re-running the command safely

It is perfectly safe to run `gpx init` multiple times. If gpx detects an existing script block in your shell config file, it will automatically replace it with the latest version rather than duplicating it.

## Related commands

- [`gpx config`](./Config.md) - Enable or disable the auto-detect feature powered by these hooks.
- [`gpx completion`](./Completion.md) - Enable tab auto-completion for your shell.
