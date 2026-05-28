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

  setOutputFlags({ json: false, quiet: false, color: true });

  mocks.loadConfig.mockReturnValue({
    auto_detect: false,
    auto_detect_notify: true,
  });
  mocks.saveConfig.mockResolvedValue(undefined);

  vi.spyOn(console, 'log').mockImplementation((msg) => consoleOutput.push(msg));
  vi.spyOn(console, 'error').mockImplementation((msg) => consoleOutput.push(msg));
});

describe('config get command', () => {
  it('should return JSON output when json flag is used', async () => {
    const code = await runConfigGetCommand(true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: { auto_detect: false },
    });
  });

  it('should return human-readable output when json flag is not used', async () => {
    const code = await runConfigGetCommand(false);
    expect(code).toBe(ExitCode.SUCCESS);
    expect(consoleOutput[0]).toContain('false');
  });

  it('should return human-readable green true if config auto_detect is true', async () => {
    mocks.loadConfig.mockReturnValue({
      auto_detect: true
    });
    const code = await runConfigGetCommand(false);
    expect(code).toBe(ExitCode.SUCCESS);
    expect(consoleOutput[0]).toContain('true');
  });
});

describe('config set command', () => {
  it('should return JSON output when json flag is true', async () => {
    const code = await runConfigSetCommand(true, true);

    expect(code).toBe(ExitCode.SUCCESS);
    const result = JSON.parse(consoleOutput[0] as string);
    expect(result).toMatchObject({
      success: true,
      data: { auto_detect: true },
    });
  });
});
