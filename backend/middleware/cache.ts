import type { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis.js";

export const cache = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        res.json(JSON.parse(cachedData));
        return;
      }

      // Preserve the original res.json
      const originalJson = res.json;
      res.json = function (this: Response, data: unknown): Response {
        // Only cache successful responses, not 4xx/5xx errors
        if (res.statusCode < 400) {
          redisClient.setEx(key, duration, JSON.stringify(data)).catch((err) => console.error("Cache write error:", err));
        }
        return originalJson.call(this, data);
      } as Response["json"];

      next();
    } catch (error) {
      console.error("Cache Error:", error);
      next();
    }
  };
};

// Clear cache by pattern (uses SCAN to avoid blocking the Redis main thread)
export const clearCache = async (pattern: string): Promise<void> => {
  try {
    let total = 0;
    for await (const keys of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      if (keys.length > 0) {
        await redisClient.del(keys);
        total += keys.length;
      }
    }
    if (total > 0) {
      console.log(`Cleared ${total} cache keys for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};
