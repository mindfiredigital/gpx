import { SSH_CONFIG_NAME_REGEX, SSH_CONFIG_NAME_REGEX_REPLACEMENT } from '../../lib/validations';

const handleConflictingRegex = (name: string): string => {
  return name.replace(SSH_CONFIG_NAME_REGEX, SSH_CONFIG_NAME_REGEX_REPLACEMENT);
};

const configRegex = (start: string, end: string): RegExp => {
  const validStart = handleConflictingRegex(start);
  const validEnd = handleConflictingRegex(end);
  return new RegExp(`${validStart}[\\s\\S]*?${validEnd}`, 'g');
};

export { configRegex };
