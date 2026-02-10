import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const HOURLY_LIMIT = 50;
const DAILY_LIMIT = 200;

let hourlyLimiter: Ratelimit | null = null;
let dailyLimiter: Ratelimit | null = null;
let initialized = false;
let upstashAvailable = false;

function ensureInit(): void {
  if (initialized) return;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[rateLimit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — rate limiting DISABLED.",
    );
    return;
  }

  const redis = new Redis({ url, token });

  hourlyLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(HOURLY_LIMIT, "1 h"),
    prefix: "ratelimit:chat:hourly",
  });

  dailyLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(DAILY_LIMIT, "1 d"),
    prefix: "ratelimit:chat:daily",
  });

  upstashAvailable = true;
}

type RateLimitResult = {
  success: boolean;
  remaining?: number;
  reset?: number;
  limit?: number;
  window?: "hourly" | "daily";
};

export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  ensureInit();

  if (!upstashAvailable) {
    return { success: true };
  }

  const hourly = await hourlyLimiter!.limit(identifier);
  if (!hourly.success) {
    return {
      success: false,
      remaining: hourly.remaining,
      reset: hourly.reset,
      limit: HOURLY_LIMIT,
      window: "hourly",
    };
  }

  const daily = await dailyLimiter!.limit(identifier);
  if (!daily.success) {
    return {
      success: false,
      remaining: daily.remaining,
      reset: daily.reset,
      limit: DAILY_LIMIT,
      window: "daily",
    };
  }

  return {
    success: true,
    remaining: Math.min(hourly.remaining, daily.remaining),
  };
}
