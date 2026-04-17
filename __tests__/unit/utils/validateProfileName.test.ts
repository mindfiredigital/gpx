import { describe, expect, it } from 'vitest';
import { validateProfileName } from '../../../src/core/profileManagement/validateProfileName';

describe('validateProfileName', () => {
  it('should accept valid names', () => {
    expect(validateProfileName('work').valid).toBe(true);
    expect(validateProfileName('personal-1').valid).toBe(true);
    expect(validateProfileName('client_team').valid).toBe(true);
  });

  it('should reject empty names', () => {
    const result = validateProfileName('');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Profile name cannot be empty');
  });

  it('should reject invalid characters', () => {
    const result = validateProfileName('work profile');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Invalid Profile name format');
  });

  it('should reject names longer than 35 characters', () => {
    const result = validateProfileName('a'.repeat(36));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Profile name too long');
  });
});
