import { buildBashInitScript, buildBashCompletionScript } from './bashShellScripts';
import { buildZshInitScript, buildZshCompletionScript } from './zshShellScripts';
import { buildPowerShellInitScript, buildPowerShellCompletionScript } from './powerShellScripts';
import { ProfileError } from '../../core/profileManagement/errorClass';
import { ExitCode } from '../../lib/constants';
import { type ShellScript } from '../../lib/types/ShellConfig.type';

export const getShellScripts = (type: string): ShellScript => {
  switch (type) {
    case 'bash':
      return { initScript: buildBashInitScript(), completionScript: buildBashCompletionScript() };
    case 'zsh':
      return { initScript: buildZshInitScript(), completionScript: buildZshCompletionScript() };
    case 'powershell':
      return {
        initScript: buildPowerShellInitScript(),
        completionScript: buildPowerShellCompletionScript(),
      };
    default:
      throw new ProfileError(
        `please use a valid shell. Bash, Zsh or Powershell`,
        ExitCode.INVALID_INPUT
      );
  }
};
