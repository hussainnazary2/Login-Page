import { PHONE_PATTERNS } from './constants';

/**
 * Validates Iranian mobile phone numbers
 * @param phone - The phone number string to validate
 * @returns boolean - True if the phone number matches Iranian mobile format
 */
export function validateIranianPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove any whitespace
  const cleanPhone = phone.trim();
  
  // Check against all supported patterns
  return Object.values(PHONE_PATTERNS).some(pattern => pattern.test(cleanPhone));
}

/**
 * Normalizes Iranian phone number to standard format (09xxxxxxxxx)
 * @param phone - The phone number to normalize
 * @returns string - Normalized phone number or original if invalid
 */
export function normalizeIranianPhone(phone: string): string {
  if (!validateIranianPhone(phone)) {
    return phone;
  }

  const cleanPhone = phone.trim();
  
  // Convert +989xxxxxxxxx to 09xxxxxxxxx
  if (cleanPhone.startsWith('+989')) {
    return '0' + cleanPhone.slice(3);
  }
  
  // Convert 00989xxxxxxxxx to 09xxxxxxxxx
  if (cleanPhone.startsWith('00989')) {
    return '0' + cleanPhone.slice(4);
  }
  
  // Already in 09xxxxxxxxx format
  return cleanPhone;
}