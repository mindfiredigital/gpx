import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { listExistingSshKeys } from '../../../src/core/sshConfigManagement/listSshKeys';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
  },
}));

vi.mock('../../../src/lib/constants', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    SSH_DIR: '/home/user/.ssh',
  };
});

describe('listExistingSshKeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array if SSH_DIR does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = listExistingSshKeys();
    expect(result).toEqual([]);
  });

  it('should return empty array if readdirSync throws', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const result = listExistingSshKeys();
    expect(result).toEqual([]);
  });

  it('should return empty array if no keys have a matching .pub file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(['id_ed25519', 'config'] as any);

    const result = listExistingSshKeys();
    expect(result).toEqual([]);
  });

  it('should return keys that have a matching .pub file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'id_ed25519_gpx_work',
      'id_ed25519_gpx_work.pub',
      'id_ed25519_gpx_personal',
      'id_ed25519_gpx_personal.pub',
      'config',
      'known_hosts',
    ] as any);

    const result = listExistingSshKeys();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'id_ed25519_gpx_work',
      privateKeyPath: path.join('/home/user/.ssh', 'id_ed25519_gpx_work'),
      publicKeyPath: path.join('/home/user/.ssh', 'id_ed25519_gpx_work.pub'),
    });
    expect(result[1]).toEqual({
      name: 'id_ed25519_gpx_personal',
      privateKeyPath: path.join('/home/user/.ssh', 'id_ed25519_gpx_personal'),
      publicKeyPath: path.join('/home/user/.ssh', 'id_ed25519_gpx_personal.pub'),
    });
  });

  it('should exclude .pub files themselves from the result', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'id_rsa',
      'id_rsa.pub',
    ] as any);

    const result = listExistingSshKeys();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('id_rsa');
  });

  it('should exclude non-key files: config, known_hosts, authorized_keys, known_hosts.old', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'config',
      'known_hosts',
      'authorized_keys',
      'known_hosts.old',
      'environment',
    ] as any);

    const result = listExistingSshKeys();
    expect(result).toHaveLength(0);
  });

  it('should handle mixed valid and invalid entries correctly', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'id_ed25519_gpx_work',
      'id_ed25519_gpx_work.pub',
      'id_rsa_orphan',
      'config',
      'known_hosts',
      'myputty.ppk',
    ] as any);

    const result = listExistingSshKeys();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('id_ed25519_gpx_work');
  });
});
