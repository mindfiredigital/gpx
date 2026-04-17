import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runCurrentCommand } from '../../../src/commands/current';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        listProfiles: vi.fn(() => [{
            name: 'work',
            display_name: 'Ansuman Panda',
            email: 'ansuman@gmail.com',
            created_at: new Date(),
        }]),
        getProfile: vi.fn((name: string) => {
            if (name === 'work') {
                return {
                    name: 'work',
                    display_name: 'Ansuman Panda',
                    email: 'ansuman@gmail.com',
                    created_at: new Date(),
                };
            }
            return undefined;
        }),
        loadActive: vi.fn(() => ({ global: 'work', switched_at: new Date() })),
        saveActive: vi.fn(),
        getCurrentGitIdentity: vi.fn(() => ({ name: 'Ansuman Panda', email: 'ansuman@gmail.com', signingKey: null })),
        isInsideGitRepo: vi.fn(() => false),
        applyProfileToGitConfig: vi.fn()
    }
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
    listProfiles: mocks.listProfiles,
    getProfile: mocks.getProfile
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
    loadActive: mocks.loadActive,
    saveActive: mocks.saveActive,
}));

vi.mock('../../../src/core/gitconfig', () => ({
    getCurrentGitIdentity: mocks.getCurrentGitIdentity,
    isInsideGitRepo: mocks.isInsideGitRepo,
    applyProfileToGitConfig: mocks.applyProfileToGitConfig,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];
    setOutputFlags({ json: false, quiet: false, noColor: true });

    vi.spyOn(console, 'log').mockImplementation(msg => consoleOutput.push(msg));
    vi.spyOn(console, 'error').mockImplementation(msg => consoleOutput.push(msg));
});

describe('command json outputs', () => {

    it('should return structured json payload', async () => {
        const code = await runCurrentCommand(true);

        expect(code).toBe(ExitCode.SUCCESS);

        const result = JSON.parse(consoleOutput[0]);
        expect(result).toMatchObject({
            success: true,
            data: { active: 'work' }
        });
    });

    it('should print local identity in human mode when inside repo', async () => {
        mocks.isInsideGitRepo.mockReturnValue(true);

        const code = await runCurrentCommand(false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(consoleOutput).toContain('Local name: Ansuman Panda');
        expect(consoleOutput).toContain('Local email: ansuman@gmail.com');
    });
});
