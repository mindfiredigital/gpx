import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runAddCommand } from '../../../src/commands/add';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        addProfile: vi.fn(),
        validateProfileName: vi.fn(),
        ask: vi.fn()
    }
}));

vi.mock('../../../src/core/profileManagement/profiles', () => ({
    addProfile: mocks.addProfile,
    validateProfileName: mocks.validateProfileName
}));

vi.mock('../../../src/utils/prompt', () => ({
    ask: mocks.ask,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
    vi.clearAllMocks();
    consoleOutput = [];

    setOutputFlags({ json: false, quiet: false, noColor: true });
    mocks.validateProfileName.mockReturnValue({ valid: true });

    vi.spyOn(console, 'log').mockImplementation(msg => consoleOutput.push(msg));
    vi.spyOn(console, 'error').mockImplementation(msg => consoleOutput.push(msg));
});

describe('add command', () => {

    it('should add profile via flags', async () => {
        const status = await runAddCommand({
            name: 'work',
            displayName: 'Ansuman Panda',
            email: 'ansuman@gmail.com',
            noInteractive: true,
            json: false,
        });

        expect(status).toBe(ExitCode.SUCCESS);
        expect(mocks.addProfile).toHaveBeenCalledOnce();
        expect(consoleOutput).toContain('Profile added: work');
    });

    it('should show error if flags are missing in --no-interactive', async () => {
        const status = await runAddCommand({
            name: 'work',
            noInteractive: true,
            json: false,
        });

        expect(status).toBe(ExitCode.INVALID_INPUT);
        expect(consoleOutput).toContain('Both --display-name and --email are required in --no-interactive mode');
    });

    it('should prompt user when fields are missing in interactive mode', async () => {
        mocks.ask.mockResolvedValueOnce('Ansuman Panda').mockResolvedValueOnce('ansuman@gmail.com');

        await runAddCommand({
            name: 'work',
            noInteractive: false,
            json: false,
        });

        expect(mocks.ask).toHaveBeenCalledTimes(2);
        expect(mocks.addProfile).toHaveBeenCalledWith(expect.objectContaining({
            name: 'work',
            display_name: 'Ansuman Panda',
            email: 'ansuman@gmail.com',
        }));
    });

    it('should show valid JSON when --json flag is used', async () => {

        mocks.ask.mockResolvedValueOnce('Ansuman Panda').mockResolvedValueOnce('ansuman@gmail.com');

        await runAddCommand({
            name: 'work',
            noInteractive: false,
            json: true,
        });

        const result = JSON.parse(consoleOutput[0] as string);
        expect(result).toMatchObject({
            success: true,
            data: {
                profile: {
                    name: 'work',
                    display_name: 'Ansuman Panda',
                    email: 'ansuman@gmail.com',
                }
            }
        });
    });
});
