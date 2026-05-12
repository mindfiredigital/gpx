import { loadActive } from '../core/profileManagement/activeStore';
import { getCurrentGitIdentity, isInsideGitRepo } from '../core/gitconfig';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printHuman, printJson } from '../utils/output';

export const runCurrentCommand = async (json: boolean): Promise<number> => {
  try {
    const active = loadActive();
    const globalIdentity = getCurrentGitIdentity('global');
    const inRepo = isInsideGitRepo();

    let localIdentity: ReturnType<typeof getCurrentGitIdentity> | null = null;
    if (inRepo) {
      const identity = getCurrentGitIdentity('local');
      if (identity.name || identity.email || identity.signingKey) {
        localIdentity = identity;
      }
    }

    const payload = {
      active: active.global,
      global: globalIdentity,
      local: localIdentity,
    };

    if (json) {
      printJson({ success: true, data: payload });
      return ExitCode.SUCCESS;
    }

    printHuman(`Active profile: ${active.global ?? 'none'}`);
    printHuman(`Global name: ${globalIdentity.name ?? 'not set'}`);
    printHuman(`Global email: ${globalIdentity.email ?? 'not set'}`);

    if (localIdentity) {
      printHuman(`Local name: ${localIdentity.name ?? 'not set'}`);
      printHuman(`Local email: ${localIdentity.email ?? 'not set'}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
