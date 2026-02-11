import { Redis } from "@upstash/redis";
import type { NonceStore } from "@slicekit/erc8128";

let redis: Redis | null = null;
let initialized = false;

function ensureRedis(): Redis | null {
  if (initialized) return redis;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[nonce-store] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — nonce verification DISABLED.",
    );
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

export const nonceStore: NonceStore = {
  async consume(key: string, ttlSeconds: number): Promise<boolean> {
    const r = ensureRedis();
    if (!r) return true; // Permissive when Redis unavailable (dev mode)

    const result = await r.set(`erc8128:nonce:${key}`, "1", {
      nx: true,
      ex: ttlSeconds,
    });
    return result === "OK";
  },
};
