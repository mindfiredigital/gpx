const buildZshInitScript = (): string => {
  return `setopt PROMPT_SUBST
    _get_current_profile_name() {
    local line
    line="$(gpx current 2>/dev/null | head -n 1)"
    if [[ "$line" == *"Active profile: "* ]]; then
        ACTIVE_PROFILE=" [\${line#Active profile: }]"
    else
        ACTIVE_PROFILE=""
    fi
}
    autoload -Uz add-zsh-hook
    add-zsh-hook precmd _get_current_profile_name
    PROMPT='%n@%m %1~%F{red}\${ACTIVE_PROFILE}%f %# '
    `;
};

const buildZshCompletionScript = (): string => {
  const commands = [
    'add:Add a new git profile',
    'use:Switch active profile',
    'ls:List all profiles',
    'current:Show currently active profile',
    'show:Show profile details',
    'remove:Remove a profile',
    'rm:Remove a profile (alias)',
    'init:Initialize shell integration',
  ];

  const commandsList = commands.map((c) => `'${c}'`).join(` `);

  return `zshCompletion() {
    local -a commands
    commands=(${commandsList})

    if (( CURRENT == 2 )); then
        _describe 'command' commands
        return
    fi

    case \${words[2]} in
        use|show|remove|rm)
            local -a profiles
            profiles=(\${(f)"$(gpx ls --json 2>/dev/null | sed -n 's/.*"name": "\\([^"]*\\)".*/\\1/p')"})

            compadd -a profiles;;
        *)
            local -a flags all_flags
            all_flags=('--json' '--no-interactive' '--no-color' '--quiet' '--help')
            for flag in "\${all_flags[@]}"; do
                if [[ ! " \${words[@]} " == *" \${flag} "* ]]; then
                    flags+=("\${flag}")
                fi
            done

            compadd -a flags;;
    esac
}

compdef zshCompletion gpx`;
};

export { buildZshInitScript, buildZshCompletionScript };
