import { loadActive } from '../core/profileManagement/activeStore';
import {
  getCurrentGitIdentity,
  isInsideGitRepo,
  getGpxLocalProfileName,
  hasIdentity,
  findProfileNameByIdentity,
} from '../core/gitconfig';
import { getProfile } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printHuman, printJson } from '../utils/output';
import type { GitIdentity } from '../lib/types/GpxConfig.type';
import type { ActiveProfileScope } from '../lib/types/ActiveStore.type';

export const runCurrentCommand = async (json: boolean): Promise<number> => {
  try {
    const active = loadActive();
    const globalIdentity = getCurrentGitIdentity('global');
    const inRepo = isInsideGitRepo();
    const globalProfileName = active.global ?? findProfileNameByIdentity(globalIdentity);

    let localIdentity: GitIdentity | null = null;
    let localProfileName: string | null = null;
    if (inRepo) {
      const identity = getCurrentGitIdentity('local');
      if (hasIdentity(identity)) {
        localIdentity = identity;
        localProfileName = getGpxLocalProfileName() ?? findProfileNameByIdentity(localIdentity);
      }
    }

    const activeScope: ActiveProfileScope = localProfileName ? 'local' : 'global';
    const activeProfile = activeScope === 'local' ? localProfileName : globalProfileName;

    const currentProfileData = activeProfile ? getProfile(activeProfile) : null;
    const authMethod = currentProfileData?.auth_method ?? null;

    const payload = {
      active: {
        profile: activeProfile,
        scope: activeScope,
        auth_method: authMethod,
      },
      global: {
        profile: globalProfileName,
        ...globalIdentity,
      },
      local: localIdentity
        ? {
          profile: localProfileName,
          ...localIdentity,
        }
        : null,
    };

    if (json) {
      printJson({ success: true, data: payload });
      return ExitCode.SUCCESS;
    }

    printHuman(`Active profile: ${activeProfile ?? 'none'}`);
    printHuman(`Scope: ${activeScope}`);
    if (authMethod)
      printHuman(`Auth method: ${authMethod}`);
    printHuman(`Global name: ${globalIdentity.name ?? 'not set'}`);
    printHuman(`Global email: ${globalIdentity.email ?? 'not set'}`);

    if (localIdentity) {
      printHuman(`Local profile: ${localProfileName ?? 'not set'}`);
      printHuman(`Local name: ${localIdentity.name ?? 'not set'}`);
      printHuman(`Local email: ${localIdentity.email ?? 'not set'}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
