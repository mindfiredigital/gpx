import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { ProfileError } from '../../../src/core/profileManagement/errorClass';
import {
    upsertSshConfigForProfile,
    removeSshConfigForProfile,
    ensureSshConfigExists
} from '../../../src/core/sshConfigManagement/sshconfig';
import { SSH_CONFIG_PATH } from '../../../src/lib/constants';

const { mocks } = vi.hoisted(() => ({
    mocks: {
        existsSync: vi.fn(),
        execFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        readSshConfig: vi.fn(),
        writeSshConfig: vi.fn(),
        buildSshBlock: vi.fn(),
        validateSshKeyForProfile: vi.fn()
    }
}));

vi.mock('node:fs', () => ({
    default: {
        existsSync: mocks.existsSync,
        writeFileSync: mocks.writeFileSync
    }
}));
vi.mock('../../../src/core/sshConfigManagement/handleConfigReadWrite', () => ({
    readSshConfig: mocks.readSshConfig,
    writeSshConfig: mocks.writeSshConfig,
    buildSshBlock: mocks.buildSshBlock,
}));
vi.mock('../../../src/core/sshConfigManagement/sshKeyExistencePermissionCheck', () => ({
    validateSshKeyForProfile: mocks.validateSshKeyForProfile,
}));
vi.mock('node:child_process', () => ({
    execFileSync: mocks.execFileSync,
}));

describe('sshconfig logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ensureSshConfigExists', () => {
        it('should create empty file if config does not exist', () => {
            mocks.existsSync.mockReturnValue(false);
            ensureSshConfigExists();
            expect(mocks.writeFileSync).toHaveBeenCalledWith(SSH_CONFIG_PATH, '', { encoding: 'utf-8' });
        });
    });

    describe('upsertSshConfigForProfile', () => {
        const mockProfile = { name: 'work', ssh_key: 'key-path' } as any;

        it('should throw Error if SSH key does not exist', async () => {
            mocks.validateSshKeyForProfile.mockReturnValue({ exists: false });

            await expect(upsertSshConfigForProfile(mockProfile))
                .rejects.toThrow(new ProfileError('ssh key not found', ExitCode.SSH_KEY_MISSING));
        });

        it('should throw Error if permissions are not strict', async () => {
            mocks.validateSshKeyForProfile.mockReturnValue({ exists: true, permissionOk: false });

            await expect(upsertSshConfigForProfile(mockProfile))
                .rejects.toThrow(new ProfileError('permission required', ExitCode.PERMISSION_ERROR));
        });

        it('should append block with double newline if config has existing content', async () => {
            mocks.validateSshKeyForProfile.mockReturnValue({ exists: true, permissionOk: true });
            mocks.readSshConfig.mockReturnValue('existing-config-content');
            mocks.buildSshBlock.mockReturnValue('new-config-block-for-profile');

            await upsertSshConfigForProfile(mockProfile);

            expect(mocks.writeSshConfig).toHaveBeenCalledWith(
                expect.stringContaining('existing-config-content\n\nnew-config-block-for-profile')
            );
        });

        it('should replace existing block if profile already exists in config', async () => {
            const oldBlock = '# BEGIN gpx:work\nOLD_PROFILE_CONFIG_BLOCK\n# END gpx:work';
            const newBlock = '# BEGIN gpx:work\nNEW_PROFILE_CONFIG_BLOCK\n# END gpx:work';

            mocks.validateSshKeyForProfile.mockReturnValue({ exists: true, permissionOk: true });
            mocks.readSshConfig.mockReturnValue(oldBlock);
            mocks.buildSshBlock.mockReturnValue(newBlock);

            await upsertSshConfigForProfile(mockProfile);

            expect(mocks.writeSshConfig).toHaveBeenCalledWith(`${newBlock}\n`);
        });
    });

    describe('removeSshConfigForProfile', () => {
        it('should return silently if profile block is not found', async () => {
            mocks.readSshConfig.mockReturnValue('HOST other-content');

            await removeSshConfigForProfile('work', 'privateKeyPath');

            expect(mocks.writeSshConfig).not.toHaveBeenCalled();
        });

        it('should remove the required profile block', async () => {
            const content = 'HOST_A\n\n# BEGIN gpx:work\nCONFIG_BLOCK_FOR_WORK_PROFILE\n# END gpx:work\n\nHOST_B';
            mocks.readSshConfig.mockReturnValue(content);

            await removeSshConfigForProfile('work', 'privateKeyPath');

            expect(mocks.writeSshConfig).toHaveBeenCalledWith('HOST_A\n\nHOST_B\n');
        });

        it('should write empty string if the last block is removed', async () => {
            const content = '# BEGIN gpx:work\nCONFIG_BLOCK_FOR_WORK_PROFILE\n# END gpx:work';
            mocks.readSshConfig.mockReturnValue(content);

            await removeSshConfigForProfile('work', 'privateKeyPath');

            expect(mocks.writeSshConfig).toHaveBeenCalledWith('');
        });
    });
});
