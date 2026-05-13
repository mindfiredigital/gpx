import { beforeEach, describe, expect, it, vi } from 'vitest';
import { githubOAuthFlow } from '../../../src/core/githubManagement/githubOAuthFlow';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import { ExitCode } from '../../../src/lib/constants';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        requestDeviceCode: vi.fn(),
        pollAccessToken: vi.fn(),
        fetchGithubUser: vi.fn(),
        addGithubToken: vi.fn(),
        getGithubToken: vi.fn()
    }
}));

vi.mock('../../../src/core/githubManagement/requestDeviceCode', () => ({
    requestDeviceCode: mocks.requestDeviceCode,
}));

vi.mock('../../../src/core/githubManagement/pollAccessToken', () => ({
    pollAccessToken: mocks.pollAccessToken,
}));

vi.mock('../../../src/core/githubManagement/fetchGithubUser', () => ({
    fetchGithubUser: mocks.fetchGithubUser,
}));

vi.mock('../../../src/utils/getGitConfig', () => ({
    addGithubToken: mocks.addGithubToken,
    getGithubToken: mocks.getGithubToken,
}));

describe('githubOAuthFlow', () => {
    const profileName = 'work';
    const mockToken = 'mock_token';
    const mockUserData = { name: 'Ansuman Panda', email: 'ansuman@gmail.com' };
    const mockDeviceCodeResponse = {
        device_code: 'mock_device_code',
        user_code: 'MOCK-1234',
        verification_uri: 'https://github.com/login/device',
        interval: 5,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return existing token and user data if token already saved', async () => {
        mocks.getGithubToken.mockResolvedValue(mockToken);
        mocks.fetchGithubUser.mockResolvedValue(mockUserData);

        const result = await githubOAuthFlow(profileName);

        expect(mocks.requestDeviceCode).not.toHaveBeenCalled();
        expect(mocks.pollAccessToken).not.toHaveBeenCalled();

        expect(result).toEqual({ ...mockUserData, token: mockToken });
    });

    it('should run full OAuth flow if no token saved', async () => {
        mocks.getGithubToken.mockResolvedValue(null);
        mocks.requestDeviceCode.mockResolvedValue(mockDeviceCodeResponse);
        mocks.pollAccessToken.mockResolvedValue(mockToken);
        mocks.fetchGithubUser.mockResolvedValue(mockUserData);
        mocks.addGithubToken.mockResolvedValue(undefined);

        const result = await githubOAuthFlow(profileName);

        expect(mocks.requestDeviceCode).toHaveBeenCalledOnce();

        expect(mocks.pollAccessToken).toHaveBeenCalledWith(
            mockDeviceCodeResponse.device_code,
            mockDeviceCodeResponse.interval
        );

        expect(mocks.addGithubToken).toHaveBeenCalledWith(profileName, mockToken);

        expect(mocks.fetchGithubUser).toHaveBeenCalledWith(mockToken);

        expect(result).toEqual({ ...mockUserData, token: mockToken });
    });

    it('should throw if requestDeviceCode fails', async () => {
        mocks.getGithubToken.mockResolvedValue(null);
        mocks.requestDeviceCode.mockRejectedValue(
            new ProfileError('error getting device code', ExitCode.INVALID_INPUT)
        );

        await expect(githubOAuthFlow(profileName))
            .rejects.toThrow('error getting device code');

        expect(mocks.pollAccessToken).not.toHaveBeenCalled();
    });

    it('should throw if user denies access during polling', async () => {
        mocks.getGithubToken.mockResolvedValue(null);
        mocks.requestDeviceCode.mockResolvedValue(mockDeviceCodeResponse);
        mocks.pollAccessToken.mockRejectedValue(
            new ProfileError('Access denied by user', ExitCode.INVALID_INPUT)
        );

        await expect(githubOAuthFlow(profileName))
            .rejects.toThrow('Access denied by user');

        expect(mocks.addGithubToken).not.toHaveBeenCalled();
    });

    it('should throw if fetching user data fails', async () => {
        mocks.getGithubToken.mockResolvedValue(null);
        mocks.requestDeviceCode.mockResolvedValue(mockDeviceCodeResponse);
        mocks.pollAccessToken.mockResolvedValue(mockToken);
        mocks.addGithubToken.mockResolvedValue(undefined);
        mocks.fetchGithubUser.mockRejectedValue(
            new ProfileError('error fetching github user', ExitCode.INVALID_INPUT)
        );

        await expect(githubOAuthFlow(profileName))
            .rejects.toThrow('error fetching github user');
    });
});