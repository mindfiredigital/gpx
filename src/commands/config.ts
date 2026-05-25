import { loadConfig, saveConfig } from '../core/profileManagement/configStore';
import { ExitCode } from '../lib/constants';
import { handleCommandError, printJson, printHuman, fmt } from '../utils/output';

const runConfigGetCommand = async (json: boolean): Promise<number> => {
  try {
    const config = loadConfig();
    const value = config.auto_detect;

    if (json) {
      printJson({
        success: true,
        data: { auto_detect: value },
      });
    } else {
      printHuman(`${value ? fmt.green(`true`) : fmt.red(`false`)}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};

const runConfigSetCommand = async (value: boolean, json: boolean): Promise<number> => {
  try {
    const config = loadConfig();
    config.auto_detect = value;
    await saveConfig(config);

    if (json) {
      printJson({
        success: true,
        data: { auto_detect: value },
      });
    } else {
      printHuman(`auto_detect set to ${value ? fmt.green(`${value}`) : fmt.red(`${value}`)}`);
    }

    return ExitCode.SUCCESS;
  } catch (error) {
    return handleCommandError(error);
  }
};

export { runConfigGetCommand, runConfigSetCommand };
