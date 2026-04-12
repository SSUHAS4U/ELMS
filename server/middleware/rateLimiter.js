import rateLimit from 'express-rate-limit';

// General rate limiter for general API routes to prevent spam
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 for heavy dashboard usage
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Strict rate limiter specifically for authentication routes (login, send-otp)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Increased to 50 for development convenience
  message: { success: false, message: 'Too many login attempts from this IP, please try again after an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

export { apiLimiter, authLimiter };
