import redis from '../config/redis';

const CATALOG_CACHE_VERSION_KEY = 'catalog:cache:version';
const DEFAULT_VERSION = 'v1';

export async function getCatalogCacheVersion(): Promise<string> {
  try {
    const current = await redis.get(CATALOG_CACHE_VERSION_KEY);
    if (current) return current;
    await redis.set(CATALOG_CACHE_VERSION_KEY, DEFAULT_VERSION);
    return DEFAULT_VERSION;
  } catch {
    return DEFAULT_VERSION;
  }
}

export async function bumpCatalogCacheVersion(): Promise<string> {
  const next = `v${Date.now()}`;
  try {
    await redis.set(CATALOG_CACHE_VERSION_KEY, next);
  } catch {
    // Best effort only; requests still work with stale cache keys.
  }
  return next;
}
