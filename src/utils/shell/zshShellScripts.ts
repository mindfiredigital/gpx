const buildZshInitScript = (): string => {
  return `setopt PROMPT_SUBST

__gpx_get_active_profile() {
    gpx current --json 2>/dev/null | awk '
        /"active"[[:space:]]*:/ { in_active = 1; next }
        in_active && /"profile"[[:space:]]*:/ {
            line = $0
            sub(/.*"profile"[[:space:]]*:[[:space:]]*"/, "", line)
            sub(/".*/, "", line)
            print line
            exit
        }
    '
}

__gpx_update_prompt_profile() {
    local profile
    profile="$(__gpx_get_active_profile)"
    if [[ -n "$profile" && "$profile" != "null" ]]; then
        ACTIVE_PROFILE="[$profile] "
    else
        ACTIVE_PROFILE=""
    fi
}

__gpx_on_directory_change() {
    local auto_detect
    auto_detect=$(gpx config get auto-detect --no-color 2>/dev/null)
    if [[ "$auto_detect" == 'true' ]]; then
        gpx autodetect --quiet 2>/dev/null
    fi
    __gpx_update_prompt_profile
}

autoload -Uz add-zsh-hook
add-zsh-hook chpwd __gpx_on_directory_change
add-zsh-hook precmd __gpx_update_prompt_profile

if [[ -z "\${__GPX_ORIGINAL_PROMPT+x}" ]]; then
    __GPX_ORIGINAL_PROMPT="$PROMPT"
    PROMPT='\${ACTIVE_PROFILE}'"$__GPX_ORIGINAL_PROMPT"
fi`;
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
