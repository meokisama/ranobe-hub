import rateLimit from "express-rate-limit";

// API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  message: { msg: "Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login rate limiting
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed login attempts
  message: { msg: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiting
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per IP per hour
  message: { msg: "Quá nhiều lần upload file. Vui lòng thử lại sau 1 giờ." },
  standardHeaders: true,
  legacyHeaders: false,
});
