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
    }
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
    getProfile: mocks.getProfile,
    removeProfile: mocks.removeProfile,
}));

vi.mock('../../../src/core/sshConfigManagement/sshconfig', () => ({
    removeSshConfigForProfile: mocks.removeSshConfigForProfile,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];

    setOutputFlags({ json: false, quiet: false, noColor: true });

    vi.spyOn(console, 'log').mockImplementation(msg => consoleOutput.push(msg));
    vi.spyOn(console, 'error').mockImplementation(msg => consoleOutput.push(msg));

    mocks.getProfile.mockReturnValue(undefined);
    mocks.removeProfile.mockResolvedValue(undefined);
    mocks.removeSshConfigForProfile.mockResolvedValue(undefined);
});

describe('remove command', () => {

    it('should remove profile and return success message', async () => {
        const code = await runRemoveCommand('work', false, false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(mocks.removeProfile).toHaveBeenCalledWith('work', false);
        expect(consoleOutput).toContain('Removed profile: work');
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
        expect(consoleOutput).toContain('profile not found');
    });
});
