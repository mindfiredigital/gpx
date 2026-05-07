import { API_BASE } from '../../lib/constants';
import { ProfileError } from '../profileManagement/errorClass';
import { ExitCode } from '../../lib/constants';

export const uploadSshKeyToGithub = async (
  token: string,
  title: string,
  publicKey: string
): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/user/keys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title, key: publicKey }),
    });

    if (!res.ok) throw new Error(`Failed to upload SSH key: ${res.statusText}`);
  } catch {
    throw new ProfileError(`error uploading ssh to github`, ExitCode.INVALID_INPUT);
  }
};
