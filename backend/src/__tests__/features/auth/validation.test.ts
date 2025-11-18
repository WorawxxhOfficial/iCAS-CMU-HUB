import { describe, it, expect } from '@jest/globals';
import { validateThaiOnlyNoSpaces, validatePhoneNumber, validateMajor } from '../../../features/auth/utils/validation';

describe('Validation Utils', () => {
  describe('validateThaiOnlyNoSpaces', () => {
    it('should return true for valid Thai text without spaces', () => {
      expect(validateThaiOnlyNoSpaces('ทดสอบ')).toBe(true);
      expect(validateThaiOnlyNoSpaces('สมชาย')).toBe(true);
    });

    it('should return false for text with spaces', () => {
      expect(validateThaiOnlyNoSpaces('ทดสอบ ระบบ')).toBe(false);
      expect(validateThaiOnlyNoSpaces('สมชาย ใจดี')).toBe(false);
    });

    it('should return false for English text', () => {
      expect(validateThaiOnlyNoSpaces('Test')).toBe(false);
      expect(validateThaiOnlyNoSpaces('John Doe')).toBe(false);
    });

    it('should return false for mixed Thai and English', () => {
      expect(validateThaiOnlyNoSpaces('ทดสอบTest')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(validateThaiOnlyNoSpaces('12345')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should return true for valid phone number format', () => {
      expect(validatePhoneNumber('081-234-5678')).toBe(true);
      expect(validatePhoneNumber('099-999-9999')).toBe(true);
      expect(validatePhoneNumber('012-345-6789')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(validatePhoneNumber('0812345678')).toBe(false); // No dashes
      expect(validatePhoneNumber('081 234 5678')).toBe(false); // Spaces instead of dashes
      expect(validatePhoneNumber('81-234-5678')).toBe(false); // Missing leading 0
      expect(validatePhoneNumber('081-23-45678')).toBe(false); // Wrong segment lengths
      expect(validatePhoneNumber('081-234-567')).toBe(false); // Last segment too short
    });

    it('should return false for empty string', () => {
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validateMajor', () => {
    it('should return true for valid majors', () => {
      expect(validateMajor('คณะวิศวกรรมศาสตร์')).toBe(true);
      expect(validateMajor('คณะวิทยาศาสตร์')).toBe(true);
      expect(validateMajor('คณะบริหารธุรกิจ')).toBe(true);
    });

    it('should return false for invalid majors', () => {
      expect(validateMajor('Invalid Major')).toBe(false);
      expect(validateMajor('')).toBe(false);
      expect(validateMajor('123')).toBe(false);
    });
  });
});

