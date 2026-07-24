import rateLimit from "express-rate-limit";

// Rate limiting cho API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 request mỗi IP trong 15 phút
  message: { msg: "Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting cho đăng nhập
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 lần đăng nhập thất bại
  message: { msg: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting cho upload file
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // Giới hạn 10 lần upload mỗi IP trong 1 giờ
  message: { msg: "Quá nhiều lần upload file. Vui lòng thử lại sau 1 giờ." },
  standardHeaders: true,
  legacyHeaders: false,
});
