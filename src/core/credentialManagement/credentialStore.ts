import { execSync, spawnSync } from 'node:child_process';
import { PLATFORM, SERVICE } from '../../lib/constants';

const storePatForProfile = async (profileName: string, pat: string): Promise<void> => {
    if (PLATFORM === 'win32') {
        execSync(`cmdkey /add:${SERVICE}:${profileName} /user:${profileName} /pass:${pat}`);
        return;
    }

    if (PLATFORM === 'darwin') {
        try {
            execSync(`security delete-generic-password -s ${SERVICE} -a ${profileName} 2>/dev/null`);
        } catch {
            // PAT doesn't exist
        }
        execSync(`security add-generic-password -l ${SERVICE}:${profileName} -s ${SERVICE} -a ${profileName} -w ${pat}`);
        return;
    }

    if (PLATFORM === 'linux') {
        const proc = spawnSync('secret-tool',
            ['store', '--label', `${SERVICE}:${profileName}`, 'service', SERVICE, 'profile', profileName],
            { input: pat }
        );
        if (proc.status !== 0) {
            throw new Error(`secret-tool store failed: ${new TextDecoder().decode(proc.stderr)}`);
        }
        return;
    }

    throw new Error(`Unsupported PLATFORM: ${PLATFORM}`);
};

const getPatForProfile = async (profileName: string): Promise<string | null> => {
    try {
        let commandString: string | undefined;
        if (PLATFORM === 'win32') {
            commandString = `command string for powershell`
        }

        if (PLATFORM === 'darwin') {
            commandString = `security find-generic-password -s ${SERVICE} -a ${profileName} -w`
        }

        if (PLATFORM === 'linux') {
            commandString = `secret-tool lookup service ${SERVICE} profile ${profileName}`;
        }

        if (commandString) {
            const result = execSync(
                commandString,
                { stdio: ['pipe', 'pipe', 'pipe'] }
            ).toString().trim();
            return result || null;
        } else
            throw new Error(`Unsupported PLATFORM: ${PLATFORM}`);
    } catch {
        return null;
    }
};

const deletePatForProfile = async (profileName: string): Promise<void> => {
    try {
        if (PLATFORM === 'win32') {
            execSync(`cmdkey /delete:${SERVICE}:${profileName}`);
            return;
        }

        if (PLATFORM === 'darwin') {
            execSync(`security delete-generic-password -s ${SERVICE} -a ${profileName}`);
            return;
        }

        if (PLATFORM === 'linux') {
            execSync(`secret-tool clear service ${SERVICE} profile ${profileName}`);
            return;
        }

        throw new Error(`Unsupported PLATFORM: ${PLATFORM}`);
    } catch {
        // PAT doesn't exist
    }
};

const hasPatForProfile = async (profileName: string): Promise<boolean> => {
    const pat = await getPatForProfile(profileName);
    return pat !== null && pat.length > 0;
};

export { storePatForProfile, getPatForProfile, deletePatForProfile, hasPatForProfile };