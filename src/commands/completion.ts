import { ExitCode } from '../lib/constants';
import { handleCommandError, printHuman, printJson } from '../utils/output';
import { ProfileError } from '../core/profileManagement/errorClass';
import type { CompleteArgs } from '../lib/types/completeCommand.type';
import { getShellScripts } from '../utils/shell/getShellScripts';

export const runCompletionCommand = async (args: CompleteArgs): Promise<number> => {
  try {
    if (!args.shell) throw new ProfileError(`--shell required`, ExitCode.INVALID_INPUT);

    const { completionScript } = getShellScripts(args.shell);

    if (args.json) {
      printJson({ success: true, data: { shell: args.shell, script: completionScript } });
    } else {
      printHuman(completionScript);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};
