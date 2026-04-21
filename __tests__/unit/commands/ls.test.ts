import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runLsCommand } from '../../../src/commands/ls';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        listProfiles: vi.fn(() => [
            {
                name: 'work',
                display_name: 'Ansuman Panda',
                email: 'ansuman@gmail.com',
                created_at: new Date(),
            },
        ]),
        loadActive: vi.fn(() => ({ global: 'work', switched_at: new Date() })),
        getCurrentGitIdentity: vi.fn(() => ({
            name: 'Ansuman Panda',
            email: 'ansuman@gmail.com',
            signingKey: null
        })),
        isInsideGitRepo: vi.fn(() => false),
    }
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
    listProfiles: mocks.listProfiles,
    getProfile: vi.fn()
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
    loadActive: mocks.loadActive,
    saveActive: vi.fn(),
}));

vi.mock('../../../src/core/gitconfig', () => ({
    getCurrentGitIdentity: mocks.getCurrentGitIdentity,
    isInsideGitRepo: mocks.isInsideGitRepo,
    applyProfileToGitConfig: vi.fn(),
}));

let consoleOutput: string[] = [];

beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];

    setOutputFlags({ json: false, quiet: false, noColor: true });

    vi.spyOn(console, 'log').mockImplementation(msg => consoleOutput.push(msg));
});

describe('ls command', () => {

    it('should return structured json payload when --json is used', async () => {
        const code = await runLsCommand(true);

        expect(code).toBe(ExitCode.SUCCESS);
        const result = JSON.parse(consoleOutput[0] as string);

        expect(result).toMatchObject({
            success: true,
            data: {
                active: 'work',
                profiles: expect.arrayContaining([
                    expect.objectContaining({ name: 'work' })
                ])
            }
        });
    });

    it('should print in list format when --json is not used', async () => {
        const code = await runLsCommand(false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(consoleOutput).toContain('* work  Ansuman Panda <ansuman@gmail.com>');
    });
});
