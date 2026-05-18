const buildBashInitScript = (): string => {
  return `__gpx_get_active_profile_name() {
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
    profile="$(__gpx_get_active_profile_name)"
    if [[ -n "$profile" && "$profile" != "null" ]]; then
        ACTIVE_PROFILE="[$profile] "
    else
        ACTIVE_PROFILE=""
    fi
}

__gpx_on_directory_change() {
    local auto_detect
    auto_detect=$(gpx config get auto-detect --quiet 2>/dev/null)
    if [[ "$auto_detect" == *"true"* ]]; then
        gpx autodetect --quiet 2>/dev/null
    fi
    __gpx_update_prompt_profile
}

__gpx_check_directory_change() {
    if [[ "$PWD" != "$__GPX_LAST_PWD" ]]; then
        __GPX_LAST_PWD="$PWD"
        __gpx_on_directory_change
    else
        __gpx_update_prompt_profile
    fi
}

if [[ "$PROMPT_COMMAND" != *__gpx_check_directory_change* ]]; then
    if [[ -n "$PROMPT_COMMAND" ]]; then
        PROMPT_COMMAND="__gpx_check_directory_change; $PROMPT_COMMAND"
    else
        PROMPT_COMMAND="__gpx_check_directory_change"
    fi
fi

if [[ -z "\${__GPX_ORIGINAL_PS1+x}" ]]; then
    __GPX_ORIGINAL_PS1="$PS1"
    PS1='\${ACTIVE_PROFILE}'"$__GPX_ORIGINAL_PS1"
fi

__GPX_LAST_PWD="$PWD"`;
};

const buildBashCompletionScript = (): string => {
  const commands = 'add ls show remove rm use current';
  const profileCommands = 'show remove rm use';
  const flags = '--json --no-interactive --no-color --quiet --help';

  return `bind 'TAB:menu-complete'
  bash_completion() {
    local curr prev commands profileCommands flags profiles

    curr="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    commands="${commands}"
    profileCommands="${profileCommands}"
    flags="${flags}"

    profiles=$(gpx ls --json 2>/dev/null | sed -n 's/.*"name": "\\([^"]*\\)".*/\\1/p')

    if [[ \${COMP_CWORD} -eq 1 ]]; then
        COMPREPLY=( $(compgen -W "\${commands}" -- "\${curr}") )
        return
    fi

    if [[ \${curr} == --* ]]; then
        filtered_flags=""
        for flag in \${flags}; do
            if [[ ! " \${COMP_WORDS[@]} " =~ " \${flag} " ]]; then
                filtered_flags+="\${flag} "
            fi
        done
        COMPREPLY=( $(compgen -W "\${filtered_flags}" -- "\${curr}") )
        return
    fi

    if [[ \${COMP_CWORD} -eq 2 && " \${profileCommands} " == *" \${prev} "* ]]; then
        COMPREPLY=( $(compgen -W "\${profiles}" -- "\${curr}") )
        return
    fi

}

complete -F bash_completion gpx`;
};

export { buildBashInitScript, buildBashCompletionScript };
