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
 * Uses a combination of avatar services to provide hijab-wearing profile pictures
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Object with hijab avatar URLs in different sizes
 */
function generateHijabAvatars(firstName: string, lastName: string) {
  const fullName = `${firstName} ${lastName}`;
  
  // Use DiceBear API with hijab-style avatars (Avataaars style with hijab option)
  const diceBearUrl = 'https://api.dicebear.com/7.x/avataaars/png';
  const params = new URLSearchParams({
    seed: fullName,
    accessories: 'hijab',
    accessoriesColor: '262e33,65c9ff,f88c49,ff5722,ff9800,ffc107,ffeb3b,cddc39,8bc34a,4caf50,009688,00bcd4,2196f3,3f51b5,673ab7,9c27b0,e91e63',
    backgroundColor: 'f3f4f6',
    clothingGraphic: 'none',
    eyebrows: 'default',
    eyes: 'default',
    facialHair: 'none',
    mouth: 'default',
    skin: 'fdbcb4,edb98a,fd9841,f8d25c,f1c27d,ffdbac'
  });

  return {
    large: `${diceBearUrl}?${params.toString()}&size=256`,
    medium: `${diceBearUrl}?${params.toString()}&size=128`,
    thumbnail: `${diceBearUrl}?${params.toString()}&size=64`
  };
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

    // Replace profile pictures with hijab avatars
    const hijabAvatars = generateHijabAvatars(user.name.first, user.name.last);

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
