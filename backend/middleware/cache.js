const redisClient = require("../config/redis");

const cache = (duration) => {
  return async (req, res, next) => {
    // Chỉ cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Lưu response gốc
      const originalJson = res.json;
      res.json = function (data) {
        // Cache data với thời gian duration
        redisClient.setEx(key, duration, JSON.stringify(data));
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache Error:", error);
      next();
    }
  };
};

// Hàm xóa cache
const clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared cache for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

module.exports = {
  cache,
  clearCache,
};
