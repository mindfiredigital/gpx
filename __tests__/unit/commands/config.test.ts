import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitCode } from '../../../src/lib/constants';
import { setOutputFlags } from '../../../src/utils/output';
import { runConfigGetCommand, runConfigSetCommand } from '../../../src/commands/config';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    loadConfig: vi.fn(),
    saveConfig: vi.fn(),
  },
}));

vi.mock('../../../src/core/profileManagement/configStore', () => ({
  loadConfig: mocks.loadConfig,
  saveConfig: mocks.saveConfig,
}));

let consoleOutput: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  consoleOutput = [];

  setOutputFlags({ json: false, quiet: false, noColor: true });

  mocks.loadConfig.mockReturnValue({
    auto_detect: false,
    auto_detect_notify: true,
  });
  mocks.saveConfig.mockResolvedValue(undefined);

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('config get command', () => {
  it('should return JSON output', async () => {
    const code = await runConfigGetCommand(true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: { auto_detect: false },
    });
  });
});

describe('config set command', () => {
  it('should return JSON output', async () => {
    const code = await runConfigSetCommand(true, true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: { auto_detect: true },
    });
  });
});
