interface GitHubUser {
    login: string;
    name: string | null;
}

interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
}

interface PatValidationResult {
    login: string;
    display_name: string;
    email: string;
}

export type { GitHubUser, GitHubEmail, PatValidationResult };