import "dotenv/config";
import { env } from "./env";

const Redis = require("ioredis");

/** Strip wrapping quotes often introduced by .env generators or copy-paste (breaks ioredis). */
function normalizeRedisUrl(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  let s = raw.trim();
  if (s.length >= 2) {
    const q = s[0];
    if ((q === '"' || q === "'") && s[s.length - 1] === q) {
      s = s.slice(1, -1).trim();
    }
  }
  return s === "" ? undefined : s;
}

const redisUrl = normalizeRedisUrl(process.env.REDIS_URL);

// For local development on Windows without Redis installed, we mock the basic methods
// if no explicit REDIS_URL is provided to prevent ECONNREFUSED crash loops.
const isRedisConfigured = redisUrl;

let redis: any;

if (isRedisConfigured) {
  redis = new Redis(redisUrl as string);
  redis.on("error", (err: any) => console.warn("Redis Error:", err.message));
} else {
  if (env.nodeEnv === "production") {
    throw new Error("REDIS_URL is required in production.");
  }
  const cache = new Map<string, string>();
  redis = {
    get: async (key: string) => cache.get(key) || null,
    set: async (key: string, val: string, mode?: string, time?: number) => {
      cache.set(key, val);
      if (mode === "EX" && time) {
        setTimeout(() => cache.delete(key), time * 1000);
      }
    },
    ping: async () => "PONG",
  };
  console.log("Redis not configured in .env. Using fallback in-memory cache.");
}

export async function isRedisReady(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}

export default redis;