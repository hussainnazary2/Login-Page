import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchRandomUser, checkApiHealth, ApiError } from '../api';
import { User, ApiResponse } from '@/types/user';

// Mock user data for testing (original API response)
const mockApiUser: User = {
  name: {
    first: 'John',
    last: 'Doe'
  },
  email: 'john.doe@example.com',
  picture: {
    large: 'https://randomuser.me/api/portraits/men/1.jpg',
    medium: 'https://randomuser.me/api/portraits/med/men/1.jpg',
    thumbnail: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
  }
};

// Expected user data with hijab avatars (what our function should return)
const mockUser: User = {
  name: {
    first: 'John',
    last: 'Doe'
  },
  email: 'john.doe@example.com',
  picture: {
    large: 'https://api.dicebear.com/7.x/avataaars/png?seed=John+Doe&accessories=hijab&accessoriesColor=262e33%2C65c9ff%2Cf88c49%2Cff5722%2Cff9800%2Cffc107%2Cffeb3b%2Ccddc39%2C8bc34a%2C4caf50%2C009688%2C00bcd4%2C2196f3%2C3f51b5%2C673ab7%2C9c27b0%2Ce91e63&backgroundColor=f3f4f6&clothingGraphic=none&eyebrows=default&eyes=default&facialHair=none&mouth=default&skin=fdbcb4%2Cedb98a%2Cfd9841%2Cf8d25c%2Cf1c27d%2Cffdbac&size=256',
    medium: 'https://api.dicebear.com/7.x/avataaars/png?seed=John+Doe&accessories=hijab&accessoriesColor=262e33%2C65c9ff%2Cf88c49%2Cff5722%2Cff9800%2Cffc107%2Cffeb3b%2Ccddc39%2C8bc34a%2C4caf50%2C009688%2C00bcd4%2C2196f3%2C3f51b5%2C673ab7%2C9c27b0%2Ce91e63&backgroundColor=f3f4f6&clothingGraphic=none&eyebrows=default&eyes=default&facialHair=none&mouth=default&skin=fdbcb4%2Cedb98a%2Cfd9841%2Cf8d25c%2Cf1c27d%2Cffdbac&size=128',
    thumbnail: 'https://api.dicebear.com/7.x/avataaars/png?seed=John+Doe&accessories=hijab&accessoriesColor=262e33%2C65c9ff%2Cf88c49%2Cff5722%2Cff9800%2Cffc107%2Cffeb3b%2Ccddc39%2C8bc34a%2C4caf50%2C009688%2C00bcd4%2C2196f3%2C3f51b5%2C673ab7%2C9c27b0%2Ce91e63&backgroundColor=f3f4f6&clothingGraphic=none&eyebrows=default&eyes=default&facialHair=none&mouth=default&skin=fdbcb4%2Cedb98a%2Cfd9841%2Cf8d25c%2Cf1c27d%2Cffdbac&size=64'
  }
};

const mockApiResponse: ApiResponse = {
  results: [mockApiUser],
  info: {
    seed: 'test-seed',
    results: 1,
    page: 1,
    version: '1.4'
  }
};

describe('fetchRandomUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fetch and return user data successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const result = await fetchRandomUser();
    
    expect(result).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith(
      'https://randomuser.me/api/?results=1&nat=ir',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('should throw ApiError for HTTP error responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('API request failed with status 404');
  });

  it('should throw ApiError for server errors (5xx)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
  });

  it('should throw ApiError for client errors (4xx)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to fetch'));

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Unable to connect to the server. Please check your internet connection and try again.');
  });

  it('should handle timeout errors', async () => {
    // Mock AbortSignal.timeout to immediately abort
    const mockAbortSignal = {
      aborted: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onabort: null,
      reason: new Error('AbortError')
    };
    
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(mockAbortSignal as any);
    
    vi.mocked(fetch).mockRejectedValueOnce(new Error('AbortError'));

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('An unexpected error occurred');
  });

  it('should throw ApiError for invalid API response structure', async () => {
    const invalidResponse = {
      results: [], // Empty results array
      info: mockApiResponse.info
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidResponse,
    } as Response);

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Invalid API response: no user data found');
  });

  it('should throw ApiError for missing results property', async () => {
    const invalidResponse = {
      info: mockApiResponse.info
      // Missing results property
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidResponse,
    } as Response);

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Invalid API response: no user data found');
  });

  it('should throw ApiError for invalid user data structure', async () => {
    const invalidUserResponse = {
      results: [{
        name: { first: 'John' }, // Missing last name
        email: 'john@example.com'
        // Missing picture
      }],
      info: mockApiResponse.info
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => invalidUserResponse,
    } as Response);

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Invalid user data: missing required fields');
  });

  it('should handle JSON parsing errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as Response);

    await expect(fetchRandomUser()).rejects.toThrow(ApiError);
    await expect(fetchRandomUser()).rejects.toThrow('An unexpected error occurred');
  });

  it('should handle AbortError specifically', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    
    vi.mocked(fetch).mockRejectedValueOnce(abortError);

    const error = await fetchRandomUser().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Request timed out. Please check your internet connection and try again.');
  });

  it('should handle unexpected errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Unexpected error'));

    await expect(fetchRandomUser()).rejects.toThrow(ApiError);
    await expect(fetchRandomUser()).rejects.toThrow('An unexpected error occurred');
  });

  it('should clear timeout on successful response', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    await fetchRandomUser();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should clear timeout on error response', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    try {
      await fetchRandomUser();
    } catch (error) {
      // Expected error
    }
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

describe('checkApiHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true when API is healthy', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    const result = await checkApiHealth();
    
    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://randomuser.me/api/?results=1&nat=ir',
      expect.objectContaining({
        method: 'HEAD',
        signal: expect.anything(),
      })
    );
  });

  it('should return false when API returns error status', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const result = await checkApiHealth();
    expect(result).toBe(false);
  });

  it('should return false when network error occurs', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const result = await checkApiHealth();
    expect(result).toBe(false);
  });

  it('should return false when timeout occurs', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Timeout'));

    const result = await checkApiHealth();
    expect(result).toBe(false);
  });

  it('should handle any unexpected errors gracefully', async () => {
    vi.mocked(fetch).mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    const result = await checkApiHealth();
    expect(result).toBe(false);
  });
});

describe('ApiError', () => {
  it('should create ApiError with message only', () => {
    const error = new ApiError('Test error');
    
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ApiError');
    expect(error.status).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it('should create ApiError with message and status', () => {
    const error = new ApiError('Test error', 404);
    
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(404);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});