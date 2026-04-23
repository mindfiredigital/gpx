/* eslint-disable no-useless-escape */

const buildBashInitScript = (): string => {
  return `get_current_profile_name() {
    local line
    line="$(gpx current 2>/dev/null | head -n 1)"
    if [[ "$line" == *"Active profile: "* ]]; then
        ACTIVE_PROFILE=" [\${line#Active profile: }]"
    else
        ACTIVE_PROFILE=""
    fi
}

PS1='\\]\\\[\\033]0;$TITLEPREFIX:$PWD\\007\\\]\\\n\\\[\\033[32m\\\]\\u@\\h \\\[\\033[35m\\\]$MSYSTEM \\\[\\033[33m\\\]\\\w\\\[\\033[36m\\\]\`__git_ps1\`\\\[\\033[31m\\\]$ACTIVE_PROFILE\\\[\\033[0m\\\]\\n$ '

if [[ ! "$PROMPT_COMMAND" == *"get_current_profile_name"* ]]; then
    PROMPT_COMMAND="\${PROMPT_COMMAND}get_current_profile_name;"
fi`;
};

export { buildBashInitScript };
