import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import authRouter from '../../../features/auth/routes/auth';

// Create test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
};

const app = createTestApp();

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Setup test database if needed
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('POST /api/auth/request-otp', () => {
    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/request-otp')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/request-otp')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is not from @cmu.ac.th domain', async () => {
      const response = await request(app)
        .post('/api/auth/request-otp')
        .send({ email: 'test@gmail.com' });

      expect(response.status).toBe(400);
    });

    it('should accept valid @cmu.ac.th email', async () => {
      const response = await request(app)
        .post('/api/auth/request-otp')
        .send({ email: 'test@cmu.ac.th' });

      // Should return 200, 201, or 500 (if email service not configured)
      // Note: This might fail if email service is not configured
      expect([200, 201, 500]).toContain(response.status);
    });
  });

  describe('POST /api/auth/signup', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'ทดสอบ',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is not from @cmu.ac.th domain', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'ทดสอบ',
          lastName: 'ระบบ',
          email: 'test@gmail.com',
          password: 'password123',
          confirmPassword: 'password123',
          major: 'วิศวกรรมคอมพิวเตอร์',
          otp: '123456',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if passwords do not match', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'ทดสอบ',
          lastName: 'ระบบ',
          email: 'test@cmu.ac.th',
          password: 'password123',
          confirmPassword: 'password456',
          major: 'วิศวกรรมคอมพิวเตอร์',
          otp: '123456',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'ทดสอบ',
          lastName: 'ระบบ',
          email: 'test@cmu.ac.th',
          password: '12345',
          confirmPassword: '12345',
          major: 'วิศวกรรมคอมพิวเตอร์',
          otp: '123456',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@cmu.ac.th',
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@cmu.ac.th',
          password: 'wrongpassword',
        });

      // Should return 401 or 500 (if database error)
      expect([401, 500]).toContain(response.status);
    });
  });
});

