import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addGithubToken, getGithubToken, deleteGithubToken } from '../../../src/utils/getGitConfig';
import { CONFIG_DIR, CONFIG_FILE } from '../../../src/lib/constants';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        existsSync: vi.fn(),
        mkdirSync: vi.fn(),
        writeFileSync: vi.fn(),
        readFileSync: vi.fn(),
        withLock: vi.fn(),
        backupFile: vi.fn(),
        atomicWrite: vi.fn(),
    }
}));

vi.mock('node:fs', () => ({
    default: {
        existsSync: mocks.existsSync,
        mkdirSync: mocks.mkdirSync,
        writeFileSync: mocks.writeFileSync,
        readFileSync: mocks.readFileSync,
    }
}));

vi.mock('../../../src/core/profileManagement/fileLocking', () => ({
    withLock: mocks.withLock,
}));

vi.mock('../../../src/core/profileManagement/storeBackup', () => ({
    backupFile: mocks.backupFile,
}));

vi.mock('../../../src/core/profileManagement/atomicWrite', () => ({
    atomicWrite: mocks.atomicWrite,
}));

describe('config token storage', () => {
    const profileName = 'work';
    const token = 'mock_token';
    const existingConfig = { github_tokens: { work: 'mock_token' } };

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.existsSync.mockReturnValue(true);
        mocks.readFileSync.mockReturnValue(JSON.stringify(existingConfig));
        mocks.withLock.mockImplementation((fn: () => void) => fn());
    });

    describe('getGithubToken', () => {
        it('should return token if it exists', async () => {
            const result = await getGithubToken(profileName);
            expect(result).toBe(token);
        });

        it('should return null if token does not exist', async () => {
            const result = await getGithubToken('nonexistent');
            expect(result).toBeNull();
        });

        it('should return null if config file does not exist', async () => {
            mocks.existsSync.mockReturnValue(false);
            const result = await getGithubToken(profileName);
            expect(result).toBeNull();
        });
    });

    describe('addGithubToken', () => {
        it('should add token for a new profile', async () => {
            mocks.readFileSync.mockReturnValue(JSON.stringify({}));

            await addGithubToken(profileName, token);

            expect(mocks.atomicWrite).toHaveBeenCalledWith(
                CONFIG_FILE,
                JSON.stringify({ github_tokens: { [profileName]: token } }, null, 2)
            );
        });

        it('should overwrite token if profile already exists', async () => {
            const newToken = 'new_token';

            await addGithubToken(profileName, newToken);

            expect(mocks.atomicWrite).toHaveBeenCalledWith(
                CONFIG_FILE,
                JSON.stringify({ github_tokens: { [profileName]: newToken } }, null, 2)
            );
        });

        it('should create config directory if it does not exist', async () => {
            await addGithubToken(profileName, token);
            expect(mocks.mkdirSync).toHaveBeenCalledWith(CONFIG_DIR, { recursive: true });
        });
    });

    describe('deleteGithubToken', () => {
        it('should delete token for existing profile', async () => {
            await deleteGithubToken(profileName);

            expect(mocks.atomicWrite).toHaveBeenCalledWith(
                CONFIG_FILE,
                JSON.stringify({ github_tokens: {} }, null, 2)
            );
        });
    });
});