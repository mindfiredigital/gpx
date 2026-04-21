import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runUseCommand } from '../../../src/commands/use';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        getProfile: vi.fn(),
        saveActive: vi.fn(),
        applyProfileToGitConfig: vi.fn()
    }
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
    getProfile: mocks.getProfile,
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
    saveActive: mocks.saveActive,
}));

vi.mock('../../../src/core/gitconfig', () => ({
    applyProfileToGitConfig: mocks.applyProfileToGitConfig,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];

    setOutputFlags({ json: false, quiet: false, noColor: true });

    mocks.getProfile.mockReturnValue({
        name: 'work',
        display_name: 'Ansuman Panda',
        email: 'ansuman@mindfire.com',
        created_at: new Date(),
    });

    vi.spyOn(console, 'log').mockImplementation(msg => consoleOutput.push(msg));
    vi.spyOn(console, 'error').mockImplementation(msg => consoleOutput.push(msg));
});

describe('use command', () => {

    it('should switch global profile and keeps active profile', async () => {
        const code = await runUseCommand('work', false, false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(mocks.applyProfileToGitConfig).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'work' }),
            'global'
        );
        expect(mocks.saveActive).toHaveBeenCalledWith(
            expect.objectContaining({ global: 'work' })
        );
        expect(consoleOutput).toContain('Switched to work (global)');
    });

    it('should switch local profile without writing to global active store', async () => {
        const code = await runUseCommand('work', true, false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(mocks.applyProfileToGitConfig).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'work' }),
            'local'
        );
        expect(mocks.saveActive).not.toHaveBeenCalled();
        expect(consoleOutput).toContain('Switched to work (local)');
    });

    it('should return json payload when --json is used', async () => {
        const code = await runUseCommand('work', false, true);

        expect(code).toBe(ExitCode.SUCCESS);
        const result = JSON.parse(consoleOutput[0] as string);
        expect(result).toMatchObject({
            success: true,
            data: {
                active: { name: 'work', scope: 'global' }
            }
        });
    });

    it('should return "profile not found" when profile does not exist', async () => {
        mocks.getProfile.mockReturnValue(undefined);

        const code = await runUseCommand('missing', false, false);

        expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
        expect(mocks.applyProfileToGitConfig).not.toHaveBeenCalled();
        expect(mocks.saveActive).not.toHaveBeenCalled();
        expect(consoleOutput).toContain('Profile not found: missing');
    });
});
