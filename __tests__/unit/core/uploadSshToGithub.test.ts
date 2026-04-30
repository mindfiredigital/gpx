import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadSshKeyToGithub } from '../../../src/core/githubManagement/uploadSshToGithub';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import { ExitCode, API_BASE } from '../../../src/lib/constants';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        fetch: vi.fn(),
    }
}));

vi.stubGlobal('fetch', mocks.fetch);

describe('uploadSshKeyToGithub', () => {
    const mockToken = 'mock_token';
    const mockTitle = 'work';
    const mockPublicKey = 'ssh-ed25519 mock-key-content email';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully upload SSH', async () => {
        mocks.fetch.mockResolvedValueOnce({ ok: true });

        await expect(uploadSshKeyToGithub(mockToken, mockTitle, mockPublicKey))
            .resolves.toBeUndefined();
    });

    it('should call fetch with correct URL, headers & body', async () => {
        mocks.fetch.mockResolvedValueOnce({ ok: true });

        await uploadSshKeyToGithub(mockToken, mockTitle, mockPublicKey);

        expect(mocks.fetch).toHaveBeenCalledWith(`${API_BASE}/user/keys`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${mockToken}`,
                Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
            body: JSON.stringify({ title: mockTitle, key: mockPublicKey }),
        });
    });

    it('should throw ProfileError if fetch fails', async () => {
        mocks.fetch.mockRejectedValueOnce(new Error('network error'));

        await expect(uploadSshKeyToGithub(mockToken, mockTitle, mockPublicKey))
            .rejects.toThrow(new ProfileError('error uploading ssh to github', ExitCode.INVALID_INPUT));
    });

    it('should call fetch exactly once', async () => {
        mocks.fetch.mockResolvedValueOnce({ ok: true });

        await uploadSshKeyToGithub(mockToken, mockTitle, mockPublicKey);

        expect(mocks.fetch).toHaveBeenCalledTimes(1);
    });
});