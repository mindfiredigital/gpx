import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runShowCommand } from '../../../src/commands/show';

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
    getProfile: mocks.getProfile
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
    vi.spyOn(console, 'error').mockImplementation(msg => consoleOutput.push(msg));
});

describe('show command', () => {

    it('should print profile details in list format', async () => {
        const code = await runShowCommand('work', false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(consoleOutput).toContain('Profile: work');
        expect(consoleOutput).toContain('Email: ansuman@gmail.com');
    });

    it('should return correct exit code for missing profile', async () => {
        setOutputFlags({ json: true });

        const code = await runShowCommand('missing', true);

        expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
    });

    it('should return structured JSON when --json is used', async () => {
        const code = await runShowCommand('work', true);

        expect(code).toBe(ExitCode.SUCCESS);
        const result = JSON.parse(consoleOutput[0]);
        expect(result).toMatchObject({
            success: true,
            data: {
                profile: {
                    name: 'work',
                    email: 'ansuman@gmail.com'
                }
            }
        });
    });
});
