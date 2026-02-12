import { Redis } from "@upstash/redis";
import { FREE_MESSAGE_LIMIT } from "@/lib/x402";

let redis: Redis | null = null;
let initialized = false;

function ensureInit(): void {
  if (initialized) return;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return;
  redis = new Redis({ url, token });
}

type FreeMessageResult = {
  allowed: boolean;
  used: number;
  limit: number;
};

/**
 * Check and increment the free message counter for a wallet address.
 * Returns whether the user is still within the free tier.
 */
export async function checkFreeMessages(
  walletAddress: string,
): Promise<FreeMessageResult> {
  ensureInit();

  if (!redis) {
    return { allowed: true, used: 0, limit: FREE_MESSAGE_LIMIT };
  }

  const key = `x402:free:${walletAddress.toLowerCase()}`;
  const current = await redis.incr(key);

  // Set TTL on first message (30 days)
  if (current === 1) {
    await redis.expire(key, 30 * 24 * 60 * 60);
  }

  return {
    allowed: current <= FREE_MESSAGE_LIMIT,
    used: current,
    limit: FREE_MESSAGE_LIMIT,
  };
}
