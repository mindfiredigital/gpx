/* eslint-disable no-useless-escape */
const buildBashInitScript = (): string => {
  return `
    get_current_profile_name() {
        local line
        line="$(gpx current | head -n 1)"
        if [[ "\$line" == *"Active profile: "* ]]; then
            GPX_PROMPT_BADGE="[\${line#Active profile: }]"
        else
            GPX_PROMPT_BADGE=""
        fi
    }

    if [ -z "\$PROMPT_COMMAND" ]; then
        PROMPT_COMMAND="get_current_profile_name"
    else 
        if [[ ! "\$PROMPT_COMMAND" == *"get_current_profile_name"* ]]; then
            PROMPT_COMMAND="\$PROMPT_COMMAND;get_current_profile_name;"
        fi
    fi

    if [[ ! "\$PS1" == *'\${GPX_PROMPT_BADGE}'* ]]; then
        PS1="\$PS1"' \${GPX_PROMPT_BADGE}'
    fi`;
};

export { buildBashInitScript };
