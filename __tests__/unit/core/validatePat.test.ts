import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validatePat } from '../../../src/core/githubManagement/validatePat';
import { API_BASE } from '../../../src/lib/constants';

describe('validatePat', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully validate PAT and return user login', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ login: 'github-test-user', name: 'GitHub Test Name' }),
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse as Response);

    const result = await validatePat('ghp_valid_token');

    expect(result).toEqual({ login: 'github-test-user' });
    expect(fetchSpy).toHaveBeenCalledWith(`${API_BASE}/user`, expect.any(Object));
  });

  it('should throw clear error on 401 Unauthorized', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse as Response);

    await expect(validatePat('ghp_invalid_token')).rejects.toThrow(
      'Invalid PAT. Please check the token and try again.'
    );
  });

  it('should throw clear error on 403 Forbidden', async () => {
    const mockResponse = {
      ok: false,
      status: 403,
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse as Response);

    await expect(validatePat('ghp_insufficient_token')).rejects.toThrow(
      'PAT does not have the required permissions.'
    );
  });

  it('should throw general error on other bad responses', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse as Response);

    await expect(validatePat('ghp_some_token')).rejects.toThrow(
      'GitHub API error: Internal Server Error'
    );
  });
});
