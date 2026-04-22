import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateSshKeyForProfile } from '../../../src/core/sshConfigManagement/generateSshKey'
import { ExitCode, SSH_DIR } from '../../../src/lib/constants';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import path from 'node:path';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        ensureSshExists: vi.fn(),
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
        execFileSync: vi.fn(),
    }
}));

vi.mock('node:fs', () => ({
    default: {
        existsSync: mocks.existsSync,
        readFileSync: mocks.readFileSync
    }
}));

vi.mock('node:child_process', () => ({
    execFileSync: mocks.execFileSync
}));

vi.mock('../../../src/core/sshConfigManagement/sshconfig', () => ({
    ensureSshExists: mocks.ensureSshExists,
}));

describe('generateSshKeyForProfile', () => {
    const profileName = 'work';
    const email = 'ansuman@gmail.com';
    const privateKeyPath = path.join(SSH_DIR, `id_ed25519_gpx_${profileName}`);
    const publicKeyPath = `${privateKeyPath}.pub`;

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.existsSync.mockReturnValue(false);
    });

    it('should return the public key on success', () => {
        const mockPublicKeyContent = 'ssh-ed25519 key-content';
        mocks.existsSync.mockReturnValue(false);
        mocks.readFileSync.mockReturnValue(mockPublicKeyContent);

        const result = generateSshKeyForProfile(profileName, email);

        expect(mocks.execFileSync).toHaveBeenCalledWith(
            'ssh-keygen',
            ['-t', 'ed25519', '-f', privateKeyPath, '-C', email, '-N', '']
        );

        expect(result).toEqual({
            privateKeyPath,
            publicKeyPath,
            publicKey: mockPublicKeyContent
        });
    });

    it('should throw Error if private key already exists', () => {
        mocks.existsSync.mockReturnValue(true);

        expect(() => generateSshKeyForProfile(profileName, email))
            .toThrow(new ProfileError(`SSH key already exists: ${privateKeyPath}`, ExitCode.INVALID_INPUT));

        expect(mocks.ensureSshExists).toHaveBeenCalled();
    });

    it('should throw Error if public key already exists', () => {
        mocks.existsSync.mockReturnValue(true);

        expect(() => generateSshKeyForProfile(profileName, email))
            .toThrow(new ProfileError(`SSH key already exists: ${privateKeyPath}`, ExitCode.INVALID_INPUT));

        expect(mocks.execFileSync).not.toHaveBeenCalled();
    });

    it('should throw Error if ssh-keygen execution fails', () => {
        mocks.existsSync.mockReturnValue(false);
        mocks.execFileSync.mockImplementation(() => { throw new Error('error executing ssh-keygen'); });

        expect(() => generateSshKeyForProfile(profileName, email))
            .toThrow(new ProfileError('Failed to generate SSK Key', ExitCode.INVALID_INPUT));
    });

    it('should throw Error if reading the generated public key fails', () => {
        mocks.existsSync.mockReturnValue(false);
        mocks.execFileSync.mockReturnValue(true);
        mocks.readFileSync.mockImplementation(() => { throw new Error('some read error'); });

        expect(() => generateSshKeyForProfile(profileName, email))
            .toThrow(new ProfileError('Failed to read generated SSH Public Key', ExitCode.PERMISSION_ERROR));
    });
});
