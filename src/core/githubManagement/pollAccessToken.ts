import { TOKEN_URL, CLIENT_ID } from '../../lib/constants';
import type { PollForAccessTokenData } from '../../lib/types/Github.type';
import { ProfileError } from '../profileManagement/errorClass';
import { ExitCode } from '../../lib/constants';

export const pollAccessToken = async (device_code: string, interval: number): Promise<string> => {
  try {
    while (true) {
      await Bun.sleep(interval * 1000);

      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });

      const data = (await res.json()) as unknown as PollForAccessTokenData;

      if (data.error === 'device_flow_disabled')
        throw new ProfileError(`Device flow is not enabled`, ExitCode.INVALID_INPUT);

      if (data.error === 'access_denied')
        throw new ProfileError(`Access denied by user`, ExitCode.INVALID_INPUT);

      if (data.access_token) return data.access_token;
    }
  } catch (error) {
    if (error instanceof ProfileError) throw error;
    throw new ProfileError(`error polling for access token`, ExitCode.INVALID_INPUT);
  }
};
