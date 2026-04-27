const buildBashInitScript = (): string => {
  return `_get_current_profile_name() {
    local line
    line="$(gpx current 2>/dev/null | head -n 1)"
    if [[ "$line" == *"Active profile: "* ]]; then
        ACTIVE_PROFILE=" [\${line#Active profile: }]"
    else
        ACTIVE_PROFILE=""
    fi
}

if [[ ! "$PROMPT_COMMAND" == *"_get_current_profile_name"* ]]; then
    PROMPT_COMMAND="\${PROMPT_COMMAND}_get_current_profile_name;"
fi

PS1='\\]\\[\\033]0;$TITLEPREFIX:$PWD\\007\\]\\\n\\[\\033[32m\\]\\u@\\h \\[\\033[35m\\]$MSYSTEM \\[\\033[33m\\]\\w\\[\\033[36m\\]\`__git_ps1\`\\[\\033[31m\\]$ACTIVE_PROFILE\\[\\033[0m\\]\\n$ '

bind 'TAB:menu-complete'`;
};

const buildBashCompletionScript = (): string => {
  const commands = 'add ls show remove rm use current';
  const profileCommands = 'show remove rm use';
  const flags = '--json --no-interactive --no-color --quiet --help';

  return `bash_completion() {
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
