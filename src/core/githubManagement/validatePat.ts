interface GitHubUser {
    login: string;
}

interface PatValidationResult {
    login: string;
}

export const validatePat = async (pat: string): Promise<PatValidationResult> => {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${pat}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
    });

    if (response.status === 401) {
        throw new Error('Invalid PAT. Please try again with a different PAT.');
    }

    if (response.status === 403) {
        throw new Error('PAT does not have required permissions.');
    }

    if (!response.ok) {
        throw new Error(`error: ${response.statusText}`);
    }

    const user = (await response.json()) as GitHubUser;

    if (!user.login) {
        throw new Error('Could not get account information.');
    }

    return {
        login: user.login,
    };
};