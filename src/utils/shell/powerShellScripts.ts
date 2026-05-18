const buildPowerShellInitScript = (): string => {
  return `function global:__gpx_get_active_profile {
    try {
        $json = gpx current --json 2>$null | Out-String
        if ([string]::IsNullOrWhiteSpace($json)) {
            return $null
        }

        $current = $json | ConvertFrom-Json
        return $current.data.active.profile
    } catch {
        return $null
    }
}

function global:__gpx_update_prompt_profile {
    $profile = __gpx_get_active_profile
    if (-not [string]::IsNullOrWhiteSpace($profile) -and $profile -ne 'null') {
        $global:ACTIVE_PROFILE = "[$profile] "
    } else {
        $global:ACTIVE_PROFILE = ''
    }
}

function global:__gpx_on_directory_change {
    try {
        $autoDetect = gpx config get auto-detect --quiet 2>$null
        if ($autoDetect -match "true") {
            gpx autodetect --quiet 2>$null | Out-Null
        }
    } catch {}
    __gpx_update_prompt_profile
}

function global:__gpx_check_directory_change {
    $currentPath = (Get-Location).Path
    if ($currentPath -ne $global:__GPX_LAST_PWD) {
        $global:__GPX_LAST_PWD = $currentPath
        __gpx_on_directory_change
    } else {
        __gpx_update_prompt_profile
    }
}

if (-not (Test-Path Function:\\__gpx_original_prompt)) {
    Copy-Item Function:\\prompt Function:\\__gpx_original_prompt -Force

    function global:prompt {
        $previousLastExitCode = $global:LASTEXITCODE
        __gpx_check_directory_change
        $global:LASTEXITCODE = $previousLastExitCode

        "$global:ACTIVE_PROFILE$(& __gpx_original_prompt)"
    }
}

$global:__GPX_LAST_PWD = (Get-Location).Path`;
};

const buildPowerShellCompletionScript = (): string => {
  return `$scriptblock = {
    param($wordToComplete, $commandAst, $cursorPosition)

    $commands = @(
        'add',
        'ls',
        'show',
        'remove',
        'rm',
        'use',
        'current',
        'init',
        'completion'
    )
    $profileCommands = @('show', 'remove', 'rm', 'use')
    $shellCommands = @('init', 'completion')
    $shells = @('bash', 'zsh', 'powershell')
    $globalFlags = @('--json', '--no-interactive', '--no-color', '--quiet', '--help')
    $commandFlags = @{
        add = @('--display-name', '--email', '--ssh-key', '--generate-ssh', '--gpg-key', '--signing')
        use = @('--local')
        remove = @('--force')
        rm = @('--force')
        init = @('--shell')
        completion = @('--shell')
    }

    function New-GpxCompletionResult {
        param(
            [string]$Value,
            [string]$ToolTip = $Value
        )

        [System.Management.Automation.CompletionResult]::new(
            $Value,
            $Value,
            [System.Management.Automation.CompletionResultType]::ParameterValue,
            $ToolTip
        )
    }

    function Get-GpxProfileNames {
        try {
            $json = gpx ls --json 2>$null | Out-String
            if ([string]::IsNullOrWhiteSpace($json)) {
                return @()
            }

            $result = $json | ConvertFrom-Json
            return @($result.data.profiles | ForEach-Object { $_.name })
        } catch {
            return @()
        }
    }

    $words = @($commandAst.CommandElements | ForEach-Object { $_.Extent.Text })
    $command = if ($words.Count -gt 1) { $words[1] } else { '' }
    $previousWord = if ($words.Count -gt 1) { $words[$words.Count - 2] } else { '' }

    if ($words.Count -eq 2 -and $wordToComplete -notlike '-*') {
        $commands |
            Where-Object { $_ -like "$wordToComplete*" } |
            ForEach-Object { New-GpxCompletionResult $_ }
        return
    }

    if ($previousWord -eq '--shell' -and $command -in $shellCommands) {
        $shells |
            Where-Object { $_ -like "$wordToComplete*" } |
            ForEach-Object { New-GpxCompletionResult $_ }
        return
    }

    if ($wordToComplete -like '--*') {
        $flags = @($globalFlags)
        if ($commandFlags.ContainsKey($command)) {
            $flags += $commandFlags[$command]
        }

        $flags |
            Select-Object -Unique |
            Where-Object { $_ -like "$wordToComplete*" } |
            ForEach-Object { New-GpxCompletionResult $_ }
        return
    }

    if ($command -in $profileCommands) {
        Get-GpxProfileNames |
            Where-Object { $_ -like "$wordToComplete*" } |
            ForEach-Object { New-GpxCompletionResult $_ }
    }
}
    Register-ArgumentCompleter -Native -CommandName gpx -ScriptBlock $scriptblock`;
};

export { buildPowerShellInitScript, buildPowerShellCompletionScript };
