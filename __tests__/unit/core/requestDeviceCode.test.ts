import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestDeviceCode } from '../../../src/core/githubManagement/requestDeviceCode';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import { ExitCode, CLIENT_ID, DEVICE_CODE_URL } from '../../../src/lib/constants';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        fetch: vi.fn(),
    }
}));

vi.stubGlobal('fetch', mocks.fetch);

describe('requestDeviceCode', () => {
    const mockDeviceCodeResponse = {
        device_code: 'mock_device_code',
        user_code: 'MOCK-1234',
        verification_uri: 'https://github.com/login/device',
        interval: 5,
        expires_in: 900,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return device code response on success', async () => {
        mocks.fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockDeviceCodeResponse),
        });

        const result = await requestDeviceCode();

        expect(result).toEqual(mockDeviceCodeResponse);
    });

    it('should call fetch with correct URL & payload', async () => {
        mocks.fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockDeviceCodeResponse),
        });

        await requestDeviceCode();

        expect(mocks.fetch).toHaveBeenCalledWith(DEVICE_CODE_URL, {
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
    });

    it('should throw ProfileError if fetch fails', async () => {
        mocks.fetch.mockRejectedValueOnce(new Error('network error'));

        await expect(requestDeviceCode())
            .rejects.toThrow(new ProfileError('error getting device code', ExitCode.INVALID_INPUT));
    });

    it('should call fetch once', async () => {
        mocks.fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue(mockDeviceCodeResponse),
        });

        await requestDeviceCode();

        expect(mocks.fetch).toHaveBeenCalledTimes(1);
    });
});