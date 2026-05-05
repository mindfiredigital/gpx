import fs from 'node:fs';
import { listProfiles } from '../core/profileManagement/profiles';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printHuman, printJson } from '../utils/output';

export const runExportCommand = async (
  includePublicKeys: boolean,
  json: boolean
): Promise<number> => {
  try {
    const profiles = listProfiles();

    if (profiles.length === 0) {
      if (json) {
        printJson({ success: true, data: { profiles: [], count: 0 } });
      } else {
        printHuman(`No profiles to export`);
      }
      return ExitCode.SUCCESS;
    }

    const exportProfiles = [];
    for (const profile of profiles) {
      const exportProfileData: Record<string, unknown> = {
        name: profile.name,
        display_name: profile.display_name,
        email: profile.email,
        ssh_key: profile.ssh_key,
        gpg_key: profile.gpg_key,
        signing_commits: profile.signing_commits,
        created_at: profile.created_at,
      };

      if (includePublicKeys && profile.ssh_key) {
        try {
          const publicKeyPath = `${profile.ssh_key}.pub`;
          if (fs.existsSync(publicKeyPath)) {
            exportProfileData['ssh_public_key'] = fs.readFileSync(publicKeyPath, {
              encoding: 'utf-8',
            });
          } else {
            exportProfileData['ssh_public_key'] = null;
          }
        } catch {
          exportProfileData['ssh_public_key'] = null;
        }
      }

      exportProfiles.push(exportProfileData);
    }

    const formatExport = {
      profiles: exportProfiles,
      exported_at: new Date().toISOString(),
    };

    if (json) {
      printJson({ success: true, data: formatExport });
    } else {
      printJson({ profiles: exportProfiles });
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
