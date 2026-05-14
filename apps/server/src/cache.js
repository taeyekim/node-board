import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const defaultTtlSeconds = Number(process.env.CACHE_TTL_SECONDS || 30);

let client = null;
let cacheReady = false;

export async function initializeCache() {
  if (!redisUrl) {
    return { enabled: false, reason: "REDIS_URL is not set" };
  }

  client = createClient({ url: redisUrl });

  client.on("error", (error) => {
    cacheReady = false;
    console.warn(`Redis cache unavailable: ${error.message}`);
  });

  try {
    await client.connect();
    cacheReady = true;
    return { enabled: true };
  } catch (error) {
    cacheReady = false;
    console.warn(`Redis cache disabled: ${error.message}`);
    return { enabled: false, reason: error.message };
  }
}

export function isCacheReady() {
  return cacheReady;
}

export async function getJson(key) {
  if (!cacheReady) {
    return null;
  }

  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn(`Redis read failed for ${key}: ${error.message}`);
    return null;
  }
}

export async function setJson(key, value, ttlSeconds = defaultTtlSeconds) {
  if (!cacheReady) {
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.warn(`Redis write failed for ${key}: ${error.message}`);
  }
}

export async function deleteKeys(keys) {
  if (!cacheReady || keys.length === 0) {
    return;
  }

  try {
    await client.del(keys);
  } catch (error) {
    console.warn(`Redis delete failed: ${error.message}`);
  }
}

export async function closeCache() {
  if (client?.isOpen) {
    await client.quit();
  }
}
