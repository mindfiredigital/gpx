import { API_BASE } from '../../lib/constants';
import type { GitHubUser } from '../../lib/types/ValidatePat.type';

export const validatePat = async (pat: string): Promise<GitHubUser> => {
  const headers = {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const userResponse = await fetch(`${API_BASE}/user`, { headers });

  if (userResponse.status === 401) {
    throw new Error('Invalid PAT. Please check the token and try again.');
  }
  if (userResponse.status === 403) {
    throw new Error('PAT does not have the required permissions.');
  }
  if (!userResponse.ok) {
    throw new Error(`GitHub API error: ${userResponse.statusText}`);
  }

  const user = (await userResponse.json()) as GitHubUser;
  if (!user.login) {
    throw new Error('Could not retrieve account information from GitHub.');
  }

  return {
    login: user.login,
  };
};
