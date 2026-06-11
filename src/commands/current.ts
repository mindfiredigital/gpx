import { loadActive } from '../core/profileManagement/activeStore';
import {
  getCurrentGitIdentity,
  isInsideGitRepo,
  getGpxLocalProfileName,
  hasIdentity,
  findProfileNameByIdentity,
  getGitRepoRoot,
} from '../core/gitconfig';
import { getProfile } from '../core/profileManagement/profiles';
import { checkCommitGuard } from '../utils/doctorCommandChecks/checkCommitGuard';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printHuman, printJson, fmt } from '../utils/output';
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

    const guardCheck = inRepo ? checkCommitGuard() : null;

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
      guard_status: guardCheck ? guardCheck.status : null,
      guard_message: guardCheck ? guardCheck.message : null,
    };

    if (json) {
      printJson({ success: true, data: payload });
      return ExitCode.SUCCESS;
    }

    const repoRoot = inRepo ? getGitRepoRoot() : null;

    if (activeScope === 'local') {
      printHuman(`Active profile: ${fmt.green(`${activeProfile}`)} (local override)`);
      printHuman(`  Name:   ${fmt.green(`${localIdentity?.name}`) ?? 'not set'}`);
      printHuman(`  Email:  ${fmt.green(`${localIdentity?.email}`) ?? 'not set'}`);
      printHuman(`  Scope:  local (${repoRoot || 'unknown'})`);
      if (globalProfileName) {
        printHuman(
          `  Global: ${globalProfileName} (${globalIdentity.name ?? 'not set'} <${globalIdentity.email ?? 'not set'}>)`
        );
      } else {
        printHuman(`  Global: not set`);
      }
    } else {
      printHuman(`Active profile: ${fmt.green(`${activeProfile}`) ?? 'none'}`);
      printHuman(`  Name:   ${fmt.green(`${globalIdentity.name}`) ?? 'not set'}`);
      printHuman(`  Email:  ${fmt.green(`${globalIdentity.email}`) ?? 'not set'}`);
      printHuman(`  Scope:  global`);
    }

    if (guardCheck) {
      printHuman(`\nCommit Guard: ${guardCheck.message}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
