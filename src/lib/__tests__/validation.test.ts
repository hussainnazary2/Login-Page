import { describe, it, expect } from 'vitest';
import { validateIranianPhone, normalizeIranianPhone } from '../validation';

describe('validateIranianPhone', () => {
  describe('valid phone numbers', () => {
    it('should validate 09xxxxxxxxx format', () => {
      expect(validateIranianPhone('09123456789')).toBe(true);
      expect(validateIranianPhone('09987654321')).toBe(true);
      expect(validateIranianPhone('09111111111')).toBe(true);
    });

    it('should validate +989xxxxxxxxx format', () => {
      expect(validateIranianPhone('+989123456789')).toBe(true);
      expect(validateIranianPhone('+989987654321')).toBe(true);
      expect(validateIranianPhone('+989111111111')).toBe(true);
    });

    it('should validate 00989xxxxxxxxx format', () => {
      expect(validateIranianPhone('00989123456789')).toBe(true);
      expect(validateIranianPhone('00989987654321')).toBe(true);
      expect(validateIranianPhone('00989111111111')).toBe(true);
    });

    it('should handle whitespace correctly', () => {
      expect(validateIranianPhone(' 09123456789 ')).toBe(true);
      expect(validateIranianPhone('  +989123456789  ')).toBe(true);
      expect(validateIranianPhone('\t00989123456789\n')).toBe(true);
    });
  });

  describe('invalid phone numbers', () => {
    it('should reject empty or null values', () => {
      expect(validateIranianPhone('')).toBe(false);
      expect(validateIranianPhone('   ')).toBe(false);
      expect(validateIranianPhone(null as any)).toBe(false);
      expect(validateIranianPhone(undefined as any)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validateIranianPhone(123456789 as any)).toBe(false);
      expect(validateIranianPhone({} as any)).toBe(false);
      expect(validateIranianPhone([] as any)).toBe(false);
      expect(validateIranianPhone(true as any)).toBe(false);
    });

    it('should reject wrong length numbers', () => {
      expect(validateIranianPhone('0912345678')).toBe(false); // too short
      expect(validateIranianPhone('091234567890')).toBe(false); // too long
      expect(validateIranianPhone('+98912345678')).toBe(false); // too short
      expect(validateIranianPhone('+9891234567890')).toBe(false); // too long
    });

    it('should reject wrong prefixes', () => {
      expect(validateIranianPhone('08123456789')).toBe(false); // wrong prefix
      expect(validateIranianPhone('9123456789')).toBe(false); // missing 0
      expect(validateIranianPhone('+98812345678')).toBe(false); // wrong prefix after +98
      expect(validateIranianPhone('0098812345678')).toBe(false); // wrong prefix after 0098
    });

    it('should reject non-numeric characters', () => {
      expect(validateIranianPhone('09123abc789')).toBe(false);
      expect(validateIranianPhone('09123-456-789')).toBe(false);
      expect(validateIranianPhone('09123 456 789')).toBe(false);
      expect(validateIranianPhone('+989123.456.789')).toBe(false);
    });

    it('should reject international formats with wrong country codes', () => {
      expect(validateIranianPhone('+1234567890')).toBe(false);
      expect(validateIranianPhone('+44123456789')).toBe(false);
      expect(validateIranianPhone('001234567890')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle various mobile operator prefixes', () => {
      // Common Iranian mobile prefixes
      const validPrefixes = ['0910', '0911', '0912', '0913', '0914', '0915', '0916', '0917', '0918', '0919', '0990', '0991', '0992', '0993', '0994', '0995', '0996', '0997', '0998', '0999'];
      
      validPrefixes.forEach(prefix => {
        const phoneNumber = prefix + '1234567';
        expect(validateIranianPhone(phoneNumber)).toBe(true);
        expect(validateIranianPhone(`+98${phoneNumber.slice(1)}`)).toBe(true);
        expect(validateIranianPhone(`0098${phoneNumber.slice(1)}`)).toBe(true);
      });
    });
  });
});

describe('normalizeIranianPhone', () => {
  describe('valid normalizations', () => {
    it('should normalize +989xxxxxxxxx to 09xxxxxxxxx', () => {
      expect(normalizeIranianPhone('+989123456789')).toBe('09123456789');
      expect(normalizeIranianPhone('+989987654321')).toBe('09987654321');
    });

    it('should normalize 00989xxxxxxxxx to 09xxxxxxxxx', () => {
      expect(normalizeIranianPhone('00989123456789')).toBe('09123456789');
      expect(normalizeIranianPhone('00989987654321')).toBe('09987654321');
    });

    it('should keep 09xxxxxxxxx format unchanged', () => {
      expect(normalizeIranianPhone('09123456789')).toBe('09123456789');
      expect(normalizeIranianPhone('09987654321')).toBe('09987654321');
    });

    it('should handle whitespace before normalization', () => {
      expect(normalizeIranianPhone(' +989123456789 ')).toBe('09123456789');
      expect(normalizeIranianPhone('  00989123456789  ')).toBe('09123456789');
      expect(normalizeIranianPhone('\t09123456789\n')).toBe('09123456789');
    });
  });

  describe('invalid phone numbers', () => {
    it('should return original value for invalid phone numbers', () => {
      expect(normalizeIranianPhone('invalid')).toBe('invalid');
      expect(normalizeIranianPhone('123456789')).toBe('123456789');
      expect(normalizeIranianPhone('+1234567890')).toBe('+1234567890');
      expect(normalizeIranianPhone('')).toBe('');
    });

    it('should handle edge cases gracefully', () => {
      expect(normalizeIranianPhone('0912345678')).toBe('0912345678'); // too short
      expect(normalizeIranianPhone('091234567890')).toBe('091234567890'); // too long
    });
  });
});