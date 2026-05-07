import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pollAccessToken } from '../../../src/core/githubManagement/pollAccessToken';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import { ExitCode } from '../../../src/lib/constants';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        fetch: vi.fn(),
        sleep: vi.fn(),
    }
}));

vi.stubGlobal('fetch', mocks.fetch);
vi.stubGlobal('Bun', { sleep: mocks.sleep });

describe('pollAccessToken', () => {
    const device_code = 'mock_device_code';
    const interval = 5;
    const mockToken = 'mock_token';

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sleep.mockResolvedValue(undefined);
    });

    it('should return access token when received', async () => {
        mocks.fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue({ access_token: mockToken }),
        });

        const result = await pollAccessToken(device_code, interval);

        expect(mocks.sleep).toHaveBeenCalledWith(interval * 1000);
        expect(result).toBe(mockToken);
    });

    it('should keep polling if authorization is pending', async () => {
        mocks.fetch
            .mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue({ error: 'authorization_pending' }),
            })
            .mockResolvedValueOnce({
                json: vi.fn().mockResolvedValue({ access_token: mockToken }),
            });

        const result = await pollAccessToken(device_code, interval);

        expect(mocks.fetch).toHaveBeenCalledTimes(2);
        expect(result).toBe(mockToken);
    });

    it('should throw ProfileError if user denies access', async () => {
        mocks.fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue({ error: 'access_denied' }),
        });

        await expect(pollAccessToken(device_code, interval))
            .rejects.toThrow(new ProfileError('Access denied by user', ExitCode.INVALID_INPUT));

        expect(mocks.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw ProfileError if device flow is disabled', async () => {
        mocks.fetch.mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue({ error: 'device_flow_disabled' }),
        });

        await expect(pollAccessToken(device_code, interval))
            .rejects.toThrow(new ProfileError('Device flow is not enabled', ExitCode.INVALID_INPUT));
    });

    it('should throw ProfileError if fetch fails', async () => {
        mocks.fetch.mockRejectedValueOnce(new Error('network error'));

        await expect(pollAccessToken(device_code, interval))
            .rejects.toThrow(new ProfileError('error polling for access token', ExitCode.INVALID_INPUT));
    });
});