import fs from 'node:fs';
import { ProfileError } from '../core/profileManagement/errorClass';
import { ExitCode } from '../lib/constants';
import type { ImportData } from '../lib/types/Import.type';
import { validateProfileName } from '../core/profileManagement/validateProfileName';
import { getProfile, addProfile } from '../core/profileManagement/profiles';
import { fmt, printError, printHuman, printJson, printSuccess, printWarn } from '../utils/output';
import { handleCommandError } from '../utils/output';
import type { Profile } from '../lib/types/Profile.type';

export const runImportCommand = async (
  importFilePath: string,
  merge: boolean,
  json: boolean
): Promise<number> => {
  try {
    if (!fs.existsSync(importFilePath))
      throw new ProfileError(`Import file not found`, ExitCode.INVALID_INPUT);

    let importFileContent: string;
    try {
      importFileContent = fs.readFileSync(importFilePath, { encoding: 'utf-8' });
    } catch {
      throw new ProfileError(`Cannot read: ${importFilePath}`, ExitCode.PERMISSION_ERROR);
    }

    const importData: ImportData = JSON.parse(importFileContent);
    const importProfiles = 'success' in importData ? importData.data.profiles : importData.profiles;

    if (!importProfiles)
      throw new ProfileError(`Invalid import file, please try again`, ExitCode.INVALID_INPUT);

    const results = {
      imported: [] as string[],
      skipped: [] as string[],
      failed: [] as { name: string; reason: string }[],
      patProfiles: [] as string[],
    };

    for (const entry of importProfiles) {
      const name = entry.name as string;

      if (!name) {
        results.failed.push({ name: '(no name)', reason: 'Missing profile name' });
        continue;
      }

      const nameValidation = validateProfileName(name);
      if (!nameValidation.valid) {
        results.failed.push({ name, reason: nameValidation.reason || 'Invalid name' });
        continue;
      }

      const existing = getProfile(name);
      if (existing) {
        if (merge) {
          results.skipped.push(name);
          continue;
        } else {
          results.failed.push({ name, reason: 'Profile already exists' });
          continue;
        }
      }

      if (!entry.display_name || !entry.email) {
        results.failed.push({ name, reason: 'Missing display_name or email' });
        continue;
      }

      const profile: Profile = {
        name: name,
        display_name: entry.display_name as string,
        email: entry.email as string,
        ssh_key: (entry.ssh_key as string) || undefined,
        gpg_key: (entry.gpg_key as string) || undefined,
        signing_commits: (entry.signing_commits as boolean) || false,
        auth_method: entry.auth_method,
        created_at: (entry.created_at as string) || new Date().toISOString(),
        last_used_at: (entry.last_used_at as string) || undefined,
      };

      try {
        await addProfile(profile);
        results.imported.push(name);
        if (profile.auth_method === 'pat') {
          results.patProfiles.push(name);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.failed.push({ name, reason: message });
      }
    }

    if (json) {
      printJson({
        success: results.failed.length === 0,
        data: results,
      });
    } else {
      for (const name of results.imported) {
        printSuccess(`✓ Imported: ${name}`);
      }
      for (const name of results.skipped) {
        printWarn(`⚠︎ Skipped: ${name} (already exists)`);
      }
      for (const fail of results.failed) {
        printError(`✗ Failed: ${fail.name} - ${fail.reason}`);
      }

      if (results.patProfiles.length > 0) {
        printWarn(`\n⚠  PAT profiles imported (token not included in export):`);
        for (const name of results.patProfiles) {
          printWarn(`Run: gpx pat set ${name}`);
        }
      }

      const total = results.imported.length + results.skipped.length + results.failed.length;
      printHuman(
        `\n${fmt.cyan(`Total - ${total}`)}, ${fmt.success(`${results.imported.length} imported`)}, ${fmt.warn(`${results.skipped.length} skipped`)}, ${fmt.error(`${results.failed.length} failed`)}\n`
      );
    }

    return results.failed.length > 0 ? ExitCode.INVALID_INPUT : ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
