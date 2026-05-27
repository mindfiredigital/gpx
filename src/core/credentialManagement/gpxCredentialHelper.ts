import { spawnSync } from 'node:child_process';
import { loadActive } from '../../core/profileManagement/activeStore';
import { getProfile } from '../../core/profileManagement/profiles';
import { getPatForProfile } from '../../core/credentialManagement/credentialStore';

const parseCredentialInput = (input: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const line of input.split('\n')) {
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) continue;
    result[line.slice(0, equalIndex).trim()] = line.slice(equalIndex + 1).trim();
  }
  return result;
};

export const runGitCredentialCommand = async (action: string): Promise<void> => {
  if (action !== 'get') return;

  const stdinData = await new Promise<string>((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk: string) => (data += chunk));
    process.stdin.on('end', () => resolve(data));

    setTimeout(() => resolve(data), 100);
  });

  const attrs = parseCredentialInput(stdinData);

  if (attrs['host'] !== 'github.com' || attrs['protocol'] !== 'https') return;

  let profileName: string | null = null;

  const proc = spawnSync('git', ['config', '--local', 'gpx.profile']);
  if (proc.status === 0) {
    profileName = proc.stdout.toString().trim();
  }

  if (!profileName) {
    const active = loadActive();
    profileName = active.global;
  }

  if (!profileName) return;

  const profile = getProfile(profileName);
  if (!profile) return;

  if (profile.auth_method !== 'pat') return;

  const pat = await getPatForProfile(profileName);
  if (!pat) return;

  const login = profile.github_login || profile.display_name;

  process.stdout.write(`username=${login}\npassword=${pat}\n\n`);
};
