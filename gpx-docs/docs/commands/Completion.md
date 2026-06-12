# Configure Auto-Completion

Enable Tab auto-completion for gpx commands and profile names in your shell.

## Usage

```bash
gpx completion --shell <shell_name>
```

## Options

| Option | Description |
|--------|-------------|
| `--shell [bash/zsh/powershell]` | The shell you are generating completion scripts for |

## Examples

To enable tab completion, you need to append the output of this command to your shell's completion configuration.

### Bash

```bash
gpx completion --shell bash >> ~/.bash_completion
```

### Zsh 

```bash
gpx completion --shell zsh >> ~/.zsh/completions/_gpx
```

### PowerShell

```powershell
gpx completion --shell powershell >> ~/Documents/WindowsPowerShell/Microsoft.PowerShell_profile.ps1
```

## What happens behind the scenes

gpx generates a native shell script containing completion rules for its subcommands, flags, and dynamically lists your saved profile names. Your shell evaluates this script so that typing `gpx use [TAB]` automatically suggests your profiles.

## Related commands

- [`gpx init`](./Init.md) - Install the terminal prompt badge and auto-detect hooks.
