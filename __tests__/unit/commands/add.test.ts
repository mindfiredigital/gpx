import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runSshAddCommand } from '../../../src/commands/add';

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

    setOutputFlags({ json: false, quiet: false, color: true });
    mocks.validateProfileName.mockReturnValue({ valid: true });

    vi.spyOn(console, 'log').mockImplementation(msg => consoleOutput.push(msg));
    vi.spyOn(console, 'error').mockImplementation(msg => consoleOutput.push(msg));
});

describe('add command', () => {

    it('should add profile via flags', async () => {
        const status = await runSshAddCommand({
            name: 'work',
            displayName: 'Ansuman Panda',
            email: 'ansuman@gmail.com',
            authMethod: 'ssh',
            noInteractive: true,
            json: false,
        });

        expect(status).toBe(ExitCode.SUCCESS);
        expect(mocks.addProfile).toHaveBeenCalledOnce();
    });

    it('should show error if flags are missing in --no-interactive', async () => {
        const status = await runSshAddCommand({
            name: 'work',
            authMethod: 'ssh',
            noInteractive: true,
            json: false,
        });

        expect(status).toBe(ExitCode.INVALID_INPUT);
    });

    it('should prompt user when fields are missing in interactive mode', async () => {
        mocks.ask.mockResolvedValueOnce('Ansuman Panda').mockResolvedValueOnce('ansuman@gmail.com');

        await runSshAddCommand({
            name: 'work',
            authMethod: 'ssh',
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

        await runSshAddCommand({
            name: 'work',
            authMethod: 'ssh',
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
