import "dotenv/config";

const Redis = require("ioredis");

// For local development on Windows without Redis installed, we mock the basic methods
// if no explicit REDIS_URL is provided to prevent ECONNREFUSED crash loops.
const isRedisConfigured = process.env.REDIS_URL;

let redis: any;

if (isRedisConfigured) {
  redis = new Redis(process.env.REDIS_URL as string);
  redis.on("error", (err: any) => console.warn("Redis Error:", err.message));
} else {
  const cache = new Map<string, string>();
  redis = {
    get: async (key: string) => cache.get(key) || null,
    set: async (key: string, val: string, mode?: string, time?: number) => {
      cache.set(key, val);
      if (mode === "EX" && time) {
        setTimeout(() => cache.delete(key), time * 1000);
      }
    },
  };
  console.log("Redis not configured in .env. Using fallback in-memory cache.");
}

export default redis;