import { API_BASE } from '../../lib/constants';
import type { ProfileData, GithubUser, EmailResponseArray } from '../../lib/types/Github.type';
import { ProfileError } from '../profileManagement/errorClass';
import { ExitCode } from '../../lib/constants';

export const fetchGithubUser = async (token: string): Promise<ProfileData> => {
  try {
    const [userRes, emailRes] = await Promise.all([
      fetch(`${API_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      }),
      fetch(`${API_BASE}/user/emails`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      }),
    ]);

    const user = (await userRes.json()) as unknown as GithubUser;
    const emails = (await emailRes.json()) as unknown as EmailResponseArray[];

    const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email;

    return {
      name: user.login,
      email: primaryEmail || user.email,
    };
  } catch {
    throw new ProfileError(`error fetching github user`, ExitCode.INVALID_INPUT);
  }
};
