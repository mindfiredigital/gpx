import fs from 'node:fs';
import path from 'node:path';
import {
  isInsideGitRepo,
  getGitRepoRoot,
  getGpxLocalProfileName,
  getRemoteUrl,
  getGpxProfileFromRemote,
  setExpectedProfile,
} from '../core/gitconfig';
import { loadActive } from '../core/profileManagement/activeStore';
import { ExitCode } from '../lib/constants';
import { printSuccess, printHuman, handleCommandError } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';

export const runGuardCommand = async (): Promise<number> => {
  try {
    if (!isInsideGitRepo()) {
      throw new ProfileError('Not inside a git repository', ExitCode.NOT_A_GIT_REPO);
    }

    const repoRoot = getGitRepoRoot();
    if (!repoRoot) {
      throw new ProfileError('Could not determine git repository root', ExitCode.NOT_A_GIT_REPO);
    }

    let expectedProfile: string | null = getGpxLocalProfileName();

    if (!expectedProfile) {
      const remoteUrl = getRemoteUrl('origin');
      if (remoteUrl) {
        expectedProfile = getGpxProfileFromRemote(remoteUrl);
      }
    }

    if (!expectedProfile) {
      const active = loadActive();
      expectedProfile = active.global;
    }

    if (expectedProfile) {
      setExpectedProfile(expectedProfile);
      printHuman(`Locked this repository to the profile: '${expectedProfile}'`);
    } else {
      printHuman(`Could not determine an active profile to lock.`);
    }

    const hooksDir = path.join(repoRoot, '.git', 'hooks');
    const preCommitHookPath = path.join(hooksDir, 'pre-commit');

    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    const hookCommand = '\n# gpx commit guard\ngpx verify-commit || exit 1\n';

    if (fs.existsSync(preCommitHookPath)) {
      const currentHook = fs.readFileSync(preCommitHookPath, { encoding: 'utf-8' });
      if (currentHook.includes('gpx verify-commit')) {
        printSuccess('Commit guard is already active in this repository.');
        return ExitCode.SUCCESS;
      }
      fs.appendFileSync(preCommitHookPath, hookCommand);
    } else {
      // Create new hook with the shebang
      const newHook = `#!/bin/sh${hookCommand}`;
      fs.writeFileSync(preCommitHookPath, newHook, { encoding: 'utf-8', mode: 0o755 });
    }

    try {
      fs.chmodSync(preCommitHookPath, 0o755);
    } catch {
      // chmod errors
    }

    printSuccess('Commit guard activated! 🛡️');
    printHuman('gpx will now prevent accidental commits to this repository.');

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
