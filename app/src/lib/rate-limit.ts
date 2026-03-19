import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  limit = 8,
  intervalSeconds = 60,
) {
  if (redis) {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${intervalSeconds} s`),
      analytics: true,
      prefix: "lnp",
    });
    return ratelimit.limit(key);
  }

  const now = Date.now();
  const current = memoryStore.get(key);
  if (!current || current.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + intervalSeconds * 1000 });
    return { success: true };
  }

  if (current.count >= limit) {
    return { success: false };
  }

  current.count += 1;
  memoryStore.set(key, current);
  return { success: true };
}
