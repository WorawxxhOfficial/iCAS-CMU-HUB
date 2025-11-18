import { describe, it, expect } from 'vitest';

// Example validation utility tests
describe('Validation Utils', () => {
  describe('Email validation', () => {
    it('should validate @cmu.ac.th emails', () => {
      const emailRegex = /^[^\s@]+@cmu\.ac\.th$/;
      expect(emailRegex.test('test@cmu.ac.th')).toBe(true);
      expect(emailRegex.test('student@cmu.ac.th')).toBe(true);
      expect(emailRegex.test('test@gmail.com')).toBe(false);
      expect(emailRegex.test('invalid')).toBe(false);
    });
  });

  describe('Password validation', () => {
    it('should require minimum 6 characters', () => {
      const minLength = 6;
      expect('password123'.length >= minLength).toBe(true);
      expect('12345'.length >= minLength).toBe(false);
      expect('pass'.length >= minLength).toBe(false);
    });
  });

  describe('Phone number validation', () => {
    it('should validate phone format 0XX-XXX-XXXX', () => {
      const phoneRegex = /^0\d{2}-\d{3}-\d{4}$/;
      expect(phoneRegex.test('081-234-5678')).toBe(true);
      expect(phoneRegex.test('099-999-9999')).toBe(true);
      expect(phoneRegex.test('0812345678')).toBe(false);
      expect(phoneRegex.test('81-234-5678')).toBe(false);
    });
  });
});

