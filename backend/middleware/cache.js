import redisClient from "../config/redis.js";

export const cache = (duration) => {
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
        // Chỉ cache response thành công, không cache lỗi 4xx/5xx
        if (res.statusCode < 400) {
          redisClient.setEx(key, duration, JSON.stringify(data)).catch((err) => console.error("Cache write error:", err));
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache Error:", error);
      next();
    }
  };
};

// Hàm xóa cache (dùng SCAN để không block Redis main thread)
export const clearCache = async (pattern) => {
  try {
    let total = 0;
    for await (const batch of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      if (batch.length > 0) {
        await redisClient.del(batch);
        total += batch.length;
      }
    }
    if (total > 0) {
      console.log(`Cleared ${total} cache keys for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};
