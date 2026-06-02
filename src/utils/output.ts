import { ExitCode } from '../lib/constants';
import { ProfileError } from '../core/profileManagement/errorClass';

let outputOptions = {
  json: false,
  quiet: false,
  color: false,
};

const setOutputFlags = (flags: { json?: boolean; quiet?: boolean; color?: boolean }): void => {
  outputOptions = { ...outputOptions, ...flags };
};

const isJsonMode = (): boolean => outputOptions.json;

const applyColor = (text: string, code: string): string => {
  return outputOptions.color ? `\x1b[${code}m${text}\x1b[0m` : text;
};

const fmt = {
  bold: (t: string): string => applyColor(t, '1'),
  dim: (t: string): string => applyColor(t, '2'),
  green: (t: string): string => applyColor(t, '32'),
  yellow: (t: string): string => applyColor(t, '33'),
  red: (t: string): string => applyColor(t, '31'),
  cyan: (t: string): string => applyColor(t, '36'),
  success: (t: string): string => applyColor(t, '32'),
  warn: (t: string): string => applyColor(t, '33'),
  error: (t: string): string => applyColor(t, '31'),
  label: (label: string, value: string): string => `${applyColor(label, '1')}: ${value}`,
};

const printJson = <T>(data: T): void => {
  console.log(JSON.stringify(data, null, 2));
};

const printJsonError = (code: number, message: string): void => {
  printJson({ success: false, error: { code, message } });
};

const printHuman = (message: string): void => {
  if (!outputOptions.quiet) console.log(message);
};

const printSuccess = (message: string): void => {
  if (!outputOptions.quiet) console.log(fmt.success(message));
};

const printWarn = (message: string): void => {
  if (!outputOptions.quiet) console.warn(fmt.warn(message));
};

const printError = (message: string): void => {
  console.error(fmt.error(message));
};

const handleCommandError = (error: unknown): number => {
  const code = error instanceof ProfileError ? error.code : ExitCode.PROFILE_NOT_FOUND;
  const message = error instanceof Error ? error.message : 'Unknown error';

  if (isJsonMode()) {
    printJsonError(code, message);
  } else {
    printError(message);
  }
  return code;
};

export {
  setOutputFlags,
  isJsonMode,
  fmt,
  printJson,
  printJsonError,
  printHuman,
  printSuccess,
  printWarn,
  printError,
  handleCommandError,
};
