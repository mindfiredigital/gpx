import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchGithubUser } from '../../../src/core/githubManagement/fetchGithubUser';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import { ExitCode } from '../../../src/lib/constants';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        fetch: vi.fn(),
    }
}));

vi.stubGlobal('fetch', mocks.fetch);

describe('fetchGithubUser', () => {
    const mockToken = 'mock_token';

    const mockUser = {
        login: 'ansumanmindfire',
        email: null,
    };

    const mockEmails = [
        { email: 'work@mindfire.com', primary: false, verified: true },
        { email: '2004.ansuman@gmail.com', primary: true, verified: true },
        { email: 'old@gmail.com', primary: false, verified: false },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return login and primary verified email', async () => {
        mocks.fetch
            .mockResolvedValueOnce({ json: vi.fn().mockResolvedValue(mockUser) })
            .mockResolvedValueOnce({ json: vi.fn().mockResolvedValue(mockEmails) })

        const result = await fetchGithubUser(mockToken);

        expect(result).toEqual({
            name: 'ansumanmindfire',
            email: '2004.ansuman@gmail.com',
        });
    });

    it('should call both /user and /user/emails endpoints', async () => {
        mocks.fetch
            .mockResolvedValueOnce({ json: vi.fn().mockResolvedValue(mockUser) })
            .mockResolvedValueOnce({ json: vi.fn().mockResolvedValue(mockEmails) });

        await fetchGithubUser(mockToken);

        expect(mocks.fetch).toHaveBeenCalledTimes(2);
        expect(mocks.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/user'),
            expect.objectContaining({
                headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
            })
        );
        expect(mocks.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/user/emails'),
            expect.objectContaining({
                headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
            })
        );
    });

    it('should throw ProfileError if fetch fails', async () => {
        mocks.fetch.mockRejectedValueOnce(new Error('some network error occured'));

        await expect(fetchGithubUser(mockToken))
            .rejects.toThrow(new ProfileError('error fetching github user', ExitCode.INVALID_INPUT));
    });
});