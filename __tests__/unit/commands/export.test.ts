import { vi, beforeEach, describe, it, expect } from "vitest"
import { ExitCode } from "../../../src/lib/constants"
import { setOutputFlags } from "../../../src/utils/output"
import { runExportCommand } from "../../../src/commands/export"

const { mocks } = vi.hoisted(() => ({
    mocks: {
        listProfiles: vi.fn(),
        readFileSync: vi.fn(),
        existsSync: vi.fn()
    }
}))

vi.mock('node:fs', () => ({
    default: {
        existsSync: mocks.existsSync,
        readFileSync: mocks.readFileSync
    }
}))

vi.mock('../../../src/core/profileManagement/profiles', () => ({
    listProfiles: mocks.listProfiles
}))

let consoleOutput: string[] = [];

const mockProfiles = [
    {
        name: 'work',
        display_name: 'ansumanmindfire',
        email: 'ansumanp@mindfiresolutions.com',
        ssh_key: '~/.ssh/id_ed25519_gpx_work',
        gpg_key: null,
        signing_commits: false,
        created_at: '2026-05-05T16:30:00Z'
    },
    {
        name: 'personal',
        display_name: 'ansumain',
        email: '2004.ansuman@gmail.com',
        ssh_key: '~/.ssh/id_ed25519_gpx_personal',
        gpg_key: null,
        signing_commits: false,
        created_at: '2026-05-05T16:30:00Z'
    }
];

beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];
    setOutputFlags({ json: false, noColor: false, quiet: false });
    mocks.listProfiles.mockReturnValue(mockProfiles);
    vi.spyOn(console, 'log').mockImplementation((message) => consoleOutput.push(message));
    vi.spyOn(console, 'error').mockImplementation((message) => consoleOutput.push(message));
});

describe('export command', () => {
    it('should export all existing profiles', async () => {
        const code = await runExportCommand(false, false);

        expect(code).toBe(ExitCode.SUCCESS);
        const output = JSON.parse(consoleOutput[0] as string);
        expect(output.profiles).toHaveLength(2);
        expect(output.profiles[0].name).toBe('work');
        expect(output.profiles[1].name).toBe('personal');
    });

    it('should export profiles in json if --json used', async () => {
        const code = await runExportCommand(false, true);

        expect(code).toBe(ExitCode.SUCCESS);
        const output = JSON.parse(consoleOutput[0] as string);
        expect(output.success).toBe(true);
        expect(output.data.profiles).toHaveLength(2);
        expect(output.data.profiles[0].name).toBe('work');
        expect(output.data.profiles[1].name).toBe('personal');
    });

    it('should include public keys if --include-public-keys used', async () => {
        mocks.existsSync.mockReturnValue(true);
        mocks.readFileSync.mockReturnValue('this is a public key');
        const code = await runExportCommand(true, false);

        expect(code).toBe(ExitCode.SUCCESS);
        const output = JSON.parse(consoleOutput[0] as string);
        expect(output.profiles[0].ssh_public_key).toBe('this is a public key');
    });

    it('should include public keys + return json if --include-public-keys & --json used', async () => {
        mocks.existsSync.mockReturnValue(true);
        mocks.readFileSync.mockReturnValue('this is a public key');
        const code = await runExportCommand(true, true);

        expect(code).toBe(ExitCode.SUCCESS);
        const output = JSON.parse(consoleOutput[0] as string);
        expect(output.data.profiles[0].ssh_public_key).toBe('this is a public key');
    });

    it('should handle no profile export attempt', async () => {
        mocks.listProfiles.mockReturnValue([]);
        const code = await runExportCommand(false, false);

        expect(code).toBe(ExitCode.SUCCESS);
        const output = consoleOutput[0] as string;
        expect(output).toBe('No profiles to export');
    })
})