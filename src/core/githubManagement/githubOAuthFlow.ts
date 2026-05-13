import { requestDeviceCode } from './requestDeviceCode';
import { pollAccessToken } from './pollAccessToken';
import { fetchGithubUser } from './fetchGithubUser';
import { addGithubToken, getGithubToken } from '../../utils/getGitConfig';
import type { ProfileData } from '../../lib/types/Github.type';

export const githubOAuthFlow = async (
  profileName: string
): Promise<ProfileData & { token: string }> => {
  const existingToken = await getGithubToken(profileName);
  if (existingToken) {
    const userData = await fetchGithubUser(existingToken);
    return { ...userData, token: existingToken };
  }

  const { device_code, user_code, verification_uri, interval } = await requestDeviceCode();

  console.log(`\n! First copy your one-time code: ${user_code}`);
  console.log(`! Then open: ${verification_uri}\n`);

  const token = await pollAccessToken(device_code, interval);

  await addGithubToken(profileName, token);

  const userData = await fetchGithubUser(token);

  return { ...userData, token };
};
