module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  JWT_EXPIRES_IN: "24h",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "$2b$10$X4wURQY0uQaLlfozM1PKlu.lG8JK78L6dDu1HTrA4k/LBGaiuJehW",
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 5, // 5 attempts
};
