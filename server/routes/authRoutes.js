import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { login, sendOtp, verifyOtp, getMe, logout, changePassword } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

router.post('/login', authLimiter, login);
router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

export default router;
