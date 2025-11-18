import { Router } from 'express';
import { signup, login, verify, logout, refresh, getMe, requestOTP, updateProfile, changePassword, deleteAccount } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/request-otp', requestOTP);
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', verify);
router.post('/logout', logout);
router.post('/refresh', refresh);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);

export default router;

