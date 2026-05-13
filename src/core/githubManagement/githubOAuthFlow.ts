import { requestDeviceCode } from './requestDeviceCode';
import { pollAccessToken } from './pollAccessToken';
import { fetchGithubUser } from './fetchGithubUser';
import type { ProfileData } from '../../lib/types/Github.type';

export const githubOAuthFlow = async (): Promise<ProfileData & { token: string }> => {
  const { device_code, user_code, verification_uri, interval } = await requestDeviceCode();

  console.log(`\n! First copy your one-time code: ${user_code}`);
  console.log(`! Then open: ${verification_uri}\n`);

  const token = await pollAccessToken(device_code, interval);
  const userData = await fetchGithubUser(token);

  return { ...userData, token };
};
