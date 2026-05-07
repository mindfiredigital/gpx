import { DEVICE_CODE_URL, CLIENT_ID } from '../../lib/constants';
import type { RequestDeviceCode } from '../../lib/types/Github.type';
import { ProfileError } from '../profileManagement/errorClass';
import { ExitCode } from '../../lib/constants';

export const requestDeviceCode = async (): Promise<RequestDeviceCode> => {
  try {
    const res = await fetch(DEVICE_CODE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        scope: 'admin:public_key read:user user:email',
      }),
    });

    return (await res.json()) as unknown as RequestDeviceCode;
  } catch {
    throw new ProfileError(`error getting device code`, ExitCode.INVALID_INPUT);
  }
};
