import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import { setOutputFlags } from '../../../src/utils/output';
import { runRemoveCommand } from '../../../src/commands/remove';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        getProfile: vi.fn(),
        removeProfile: vi.fn(),
        removeSshConfigForProfile: vi.fn(),
        loadActive: vi.fn(),
        saveActive: vi.fn(),
        clearGitIdentity: vi.fn(),
        clearLocalProfileMarker: vi.fn(),
        getGpxLocalProfileName: vi.fn(),
        isInsideGitRepo: vi.fn(),
        moveSshKeysToRemoved: vi.fn(),
    }
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
    getProfile: mocks.getProfile,
    removeProfile: mocks.removeProfile,
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
    loadActive: mocks.loadActive,
    saveActive: mocks.saveActive,
}));

vi.mock('../../../src/core/gitconfig', () => ({
    clearGitIdentity: mocks.clearGitIdentity,
    clearLocalProfileMarker: mocks.clearLocalProfileMarker,
    getGpxLocalProfileName: mocks.getGpxLocalProfileName,
    isInsideGitRepo: mocks.isInsideGitRepo,
}));

vi.mock('../../../src/core/sshConfigManagement/sshconfig', () => ({
    removeSshConfigForProfile: mocks.removeSshConfigForProfile,
}));

vi.mock('../../../src/utils/moveSshOnRemove', () => ({
    moveSshKeysToRemoved: mocks.moveSshKeysToRemoved,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];

    setOutputFlags({ json: false, quiet: false, color: true });

    vi.spyOn(console, 'log').mockImplementation(msg => consoleOutput.push(msg));
    vi.spyOn(console, 'error').mockImplementation(msg => consoleOutput.push(msg));

    mocks.getProfile.mockReturnValue(undefined);
    mocks.loadActive.mockReturnValue({ global: null, switched_at: null });
    mocks.isInsideGitRepo.mockReturnValue(false);
    mocks.removeProfile.mockResolvedValue(undefined);
    mocks.removeSshConfigForProfile.mockResolvedValue(undefined);
});

describe('remove command', () => {

    it('should remove profile and return success message', async () => {
        const code = await runRemoveCommand('work', false, false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(mocks.removeProfile).toHaveBeenCalledWith('work', false);
    });

    it('should return structured JSON when in --json is used', async () => {
        const code = await runRemoveCommand('work', false, true);

        expect(code).toBe(ExitCode.SUCCESS);
        const result = JSON.parse(consoleOutput[0] as string);
        expect(result).toMatchObject({
            success: true,
            data: { removed: 'work' }
        });
    });

    it('should map ProfileError to the correct exit code', async () => {
        mocks.removeProfile.mockRejectedValueOnce(
            new ProfileError('profile not found', ExitCode.PROFILE_NOT_FOUND)
        );

        const code = await runRemoveCommand('no-profile', false, false);

        expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
    });

    it('should clear global git identity when removing active profile', async () => {
        mocks.getProfile.mockReturnValue({ name: 'work' });
        mocks.loadActive.mockReturnValue({ global: 'work', switched_at: '2026-05-21T18:53:13Z' });

        const code = await runRemoveCommand('work', true, false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(mocks.clearGitIdentity).toHaveBeenCalledWith('global');
        expect(mocks.saveActive).toHaveBeenCalledWith({ global: null, switched_at: null });
    });

    it('should clear local git identity when local profile matches in repo', async () => {
        mocks.getProfile.mockReturnValue({ name: 'personal' });
        mocks.loadActive.mockReturnValue({ global: null, switched_at: null });
        mocks.isInsideGitRepo.mockReturnValue(true);
        mocks.getGpxLocalProfileName.mockReturnValue('personal');

        const code = await runRemoveCommand('personal', false, false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(mocks.clearGitIdentity).toHaveBeenCalledWith('local');
        expect(mocks.clearLocalProfileMarker).toHaveBeenCalled();
    });
});
