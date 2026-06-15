import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runShowCommand } from '../../../src/commands/show';
import { hasPatForProfile } from '../../../src/core/credentialManagement/credentialStore';

let mockPlatform = 'darwin';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        getProfile: vi.fn(),
        loadActive: vi.fn(() => ({ global: 'work', switched_at: new Date() })),
    }
}));

vi.mock('../../../src/lib/constants', async (importOriginal) => {
    const original = await importOriginal<any>();
    return {
        ...original,
        get PLATFORM() {
            return mockPlatform;
        },
    };
});

vi.mock('../../../src/core/profileManagement/profiles', () => ({
    getProfile: mocks.getProfile
}));

vi.mock('../../../src/core/profileManagement/activeStore', () => ({
    loadActive: mocks.loadActive,
}));

vi.mock('../../../src/core/credentialManagement/credentialStore', () => ({
    hasPatForProfile: vi.fn(),
}));

let consoleOutput: string[] = [];

beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];
    mockPlatform = 'darwin';
    setOutputFlags({ json: false, quiet: false, color: true });

    vi.spyOn(console, 'log').mockImplementation(msg => consoleOutput.push(msg));
    vi.spyOn(console, 'error').mockImplementation(msg => consoleOutput.push(msg));
});

describe('show command', () => {
    it('should print profile details in list format', async () => {
        mocks.getProfile.mockReturnValue({
            name: 'work',
            display_name: 'Ansuman Panda',
            email: 'ansuman@gmail.com',
            auth_method: 'ssh',
            ssh_key: '/keys/id_work',
            gpg_key: 'GPG_KEY_123',
            signing_commits: true,
            created_at: '2026-05-28',
            last_used_at: '2026-05-28',
        });

        const code = await runShowCommand('work', false);

        expect(code).toBe(ExitCode.SUCCESS);
        expect(consoleOutput).toContain('Profile: work');
        expect(consoleOutput).toContain('Email: ansuman@gmail.com');
        expect(consoleOutput).toContain('SSH key: /keys/id_work');
        expect(consoleOutput).toContain('GPG key: GPG_KEY_123');
        expect(consoleOutput).toContain('Signing commits: enabled');
        expect(consoleOutput).toContain('Active: yes');
    });

    it('should return correct exit code for missing profile', async () => {
        mocks.getProfile.mockReturnValue(undefined);
        const code = await runShowCommand('missing', false);
        expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
    });

    it('should return structured JSON when --json is used', async () => {
        mocks.getProfile.mockReturnValue({
            name: 'work',
            display_name: 'Ansuman Panda',
            email: 'ansuman@gmail.com',
            auth_method: 'ssh',
            created_at: '2026-05-28',
        });

        const code = await runShowCommand('work', true);

        expect(code).toBe(ExitCode.SUCCESS);
        const result = JSON.parse(consoleOutput[0] as string);
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



    it('should handle errors gracefully', async () => {
        mocks.getProfile.mockImplementation(() => {
            throw new Error('some error occured');
        });
        const code = await runShowCommand('work', false);
        expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
    });
});
