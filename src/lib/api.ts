import { ApiResponse, User } from '@/types/user';
import { API_CONFIG, ERROR_MESSAGES } from './constants';

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generates hijab avatar URLs based on user name and gender
 * Uses DiceBear API to provide hijab-wearing profile pictures
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Object with hijab avatar URLs in different sizes
 */
function generateHijabAvatars(firstName: string, lastName: string) {
  const fullName = `${firstName} ${lastName}`;
  
  // Use DiceBear API with avataaars style
  const diceBearUrl = 'https://api.dicebear.com/8.x/avataaars/png';
  
  // Simplified parameters that work reliably
  const params = new URLSearchParams({
    seed: fullName,
    // Use top instead of accessories for hijab
    top: 'hijab',
    topColor: '262e33,65c9ff,f88c49,ff5722,ff9800,ffc107',
    backgroundColor: 'f3f4f6',
    clothingGraphic: 'none',
    eyebrows: 'default',
    eyes: 'default',
    facialHair: 'none',
    mouth: 'default',
    skinColor: 'fdbcb4,edb98a,fd9841,f8d25c,f1c27d,ffdbac'
  });

  const baseUrl = `${diceBearUrl}?${params.toString()}`;

  return {
    large: `${baseUrl}&size=256`,
    medium: `${baseUrl}&size=128`,
    thumbnail: `${baseUrl}&size=64`
  };
}

/**
 * Alternative hijab avatar generator using different approach
 * Fallback if main generator doesn't work
 */
function generateAlternativeHijabAvatars(firstName: string, lastName: string) {
  const fullName = `${firstName} ${lastName}`;
  
  // Use Adventurer style which has better hijab support
  const diceBearUrl = 'https://api.dicebear.com/8.x/adventurer/png';
  
  const params = new URLSearchParams({
    seed: fullName,
    backgroundColor: 'f3f4f6'
  });

  const baseUrl = `${diceBearUrl}?${params.toString()}`;

  return {
    large: `${baseUrl}&size=256`,
    medium: `${baseUrl}&size=128`,
    thumbnail: `${baseUrl}&size=64`
  };
}

/**
 * Test avatar URL validity
 * @param url - Avatar URL to test
 * @returns Promise<boolean> - True if URL is valid and accessible
 */
async function testAvatarUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches a random Iranian user from the RandomUser API with hijab avatars
 * @returns Promise<User> - Promise that resolves to a User object with hijab avatars
 * @throws ApiError - When API request fails or returns invalid data
 */
export async function fetchRandomUser(): Promise<User> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch(API_CONFIG.RANDOM_USER_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        `API request failed with status ${response.status}`,
        response.status
      );
    }

    const data: ApiResponse = await response.json();

    // Validate API response structure
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      throw new ApiError('Invalid API response: no user data found');
    }

    const user = data.results[0];

    // Validate user data structure
    if (!user.name || !user.email || !user.picture) {
      throw new ApiError('Invalid user data: missing required fields');
    }

    // Generate hijab avatars
    let hijabAvatars = generateHijabAvatars(user.name.first, user.name.last);

    // Test if the primary avatar URL works, fallback to alternative if not
    const isValidUrl = await testAvatarUrl(hijabAvatars.medium);
    if (!isValidUrl) {
      console.warn('Primary hijab avatar failed, using alternative generator');
      hijabAvatars = generateAlternativeHijabAvatars(user.name.first, user.name.last);
    }

    return {
      ...user,
      picture: hijabAvatars
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(ERROR_MESSAGES.NETWORK.TIMEOUT);
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new ApiError(ERROR_MESSAGES.NETWORK.CONNECTION_ERROR);
      }
    }

    throw new ApiError('An unexpected error occurred');
  }
}

/**
 * Validates if the API is reachable (optional utility for health checks)
 * @returns Promise<boolean> - True if API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(API_CONFIG.RANDOM_USER_URL, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Debug function to test avatar generation
 * Use this to verify avatar URLs are working
 */
export async function debugAvatarGeneration(firstName: string, lastName: string) {
  console.log('Testing avatar generation for:', firstName, lastName);
  
  const primary = generateHijabAvatars(firstName, lastName);
  const alternative = generateAlternativeHijabAvatars(firstName, lastName);
  
  console.log('Primary avatars:', primary);
  console.log('Alternative avatars:', alternative);
  
  // Test URLs
  const primaryValid = await testAvatarUrl(primary.medium);
  const altValid = await testAvatarUrl(alternative.medium);
  
  console.log('Primary avatar valid:', primaryValid);
  console.log('Alternative avatar valid:', altValid);
  
  return { primary, alternative, primaryValid, altValid };
}
