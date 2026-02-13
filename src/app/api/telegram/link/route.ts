import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

/** TTL for link codes — 10 minutes */
const LINK_CODE_TTL = 10 * 60;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function generateCode(): string {
  // 6 uppercase alphanumeric chars (easy to type on mobile)
  return crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

/**
 * POST /api/telegram/link
 * Body: { walletAddress: string }
 * Returns: { code: string, expiresIn: number }
 *
 * Generates a one-time link code for connecting a Telegram chat to a wallet.
 * User sends `/connect <code>` in Telegram to complete the link.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { walletAddress?: string };
    const wallet = body.walletAddress;

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 },
      );
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 503 },
      );
    }

    const code = generateCode();
    await redis.set(`telegram:linkcode:${code}`, wallet, {
      ex: LINK_CODE_TTL,
    });

    return NextResponse.json({ code, expiresIn: LINK_CODE_TTL });
  } catch (err) {
    console.error("[telegram/link] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
