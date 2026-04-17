import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
    handleCommandError,
    printError,
    printHuman,
    printSuccess,
    printWarn,
    setOutputFlags,
} from '../../../src/utils/output';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import { ExitCode } from '../../../src/lib/constants';

let consoleOutput: string[] = [];

beforeEach(() => {
    consoleOutput = [];
    vi.clearAllMocks();

    setOutputFlags({ json: false, quiet: false, noColor: true });

    vi.spyOn(console, 'log').mockImplementation(m => consoleOutput.push(m));
    vi.spyOn(console, 'warn').mockImplementation(m => consoleOutput.push(m));
    vi.spyOn(console, 'error').mockImplementation(m => consoleOutput.push(m));
});

describe('output utilities', () => {

    it('should print messages when --quiet is not used', () => {
        printHuman('data');
        printSuccess('success');
        printWarn('warning');
        printError('error');

        expect(consoleOutput).toEqual(['data', 'success', 'warning', 'error']);
    });

    it('should not print message when --quiet is used', () => {
        setOutputFlags({ quiet: true });

        printHuman('data');
        printSuccess('success');
        printWarn('warning');

        expect(consoleOutput).toHaveLength(0);
    });

    it('should handle other errors by returning code 1', () => {
        const code = handleCommandError(new Error('some error'));

        expect(code).toBe(1);
        expect(consoleOutput).toContain('some error');
    });

    it('should get the specific ExitCode from a ProfileError', () => {
        const customErr = new ProfileError('missing profile', ExitCode.PROFILE_NOT_FOUND);
        const code = handleCommandError(customErr);

        expect(code).toBe(ExitCode.PROFILE_NOT_FOUND);
        expect(consoleOutput).toContain('missing profile');
    });
});
