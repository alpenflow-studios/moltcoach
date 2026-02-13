import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { createServerClient } from "@/lib/supabase";

const anthropic = new Anthropic();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const DEFAULT_AGENT_NAME = "ClawCoach";
const DEFAULT_COACHING_STYLE = "motivator";

/** Max messages to keep per chat (20 messages = 10 user/assistant turns) */
const MAX_HISTORY = 20;
/** Redis key TTL — 7 days of inactivity */
const HISTORY_TTL_SECONDS = 7 * 24 * 60 * 60;

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string };
    chat: { id: number; type: string };
    text?: string;
  };
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// ---------------------------------------------------------------------------
// Redis singleton (lazy init)
// ---------------------------------------------------------------------------

let redis: Redis | null = null;
let redisInitialized = false;

function getRedis(): Redis | null {
  if (redisInitialized) return redis;
  redisInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

function historyKey(chatId: number): string {
  return `telegram:history:${chatId}`;
}

async function loadHistory(chatId: number): Promise<ChatMessage[]> {
  const r = getRedis();
  if (!r) return [];

  const raw = await r.get<ChatMessage[]>(historyKey(chatId));
  if (!raw || !Array.isArray(raw)) return [];
  return raw;
}

async function saveHistory(chatId: number, messages: ChatMessage[]): Promise<void> {
  const r = getRedis();
  if (!r) return;

  // Trim to MAX_HISTORY most recent
  const trimmed = messages.slice(-MAX_HISTORY);
  await r.set(historyKey(chatId), trimmed, { ex: HISTORY_TTL_SECONDS });
}

async function clearHistory(chatId: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.del(historyKey(chatId));
}

// ---------------------------------------------------------------------------
// Telegram helpers
// ---------------------------------------------------------------------------

async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not set" },
      { status: 503 },
    );
  }

  try {
    const update = (await req.json()) as TelegramUpdate;
    const message = update.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const userText = message.text;

    // Handle /start command
    if (userText.startsWith("/start")) {
      await clearHistory(chatId);
      await sendTelegramMessage(
        chatId,
        "Welcome to ClawCoach! I'm your AI fitness coach. Tell me about your fitness goals and I'll create a personalized plan for you.\n\nCommands:\n/connect <CODE> — Link your wallet (get code at clawcoach.ai)\n/reset — Clear conversation history\n\nTip: Connect your wallet at clawcoach.ai for on-chain identity and $CLAWC rewards.",
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /reset command
    if (userText.startsWith("/reset")) {
      await clearHistory(chatId);
      await sendTelegramMessage(
        chatId,
        "Conversation history cleared. Let's start fresh! What are your fitness goals?",
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /connect <code> command — link Telegram to wallet
    if (userText.startsWith("/connect")) {
      const code = userText.replace("/connect", "").trim().toUpperCase();
      if (!code || code.length < 4) {
        await sendTelegramMessage(
          chatId,
          "Usage: /connect <CODE>\n\nGet your link code at clawcoach.ai → Agent page → Link Telegram.",
        );
        return NextResponse.json({ ok: true });
      }

      const r = getRedis();
      if (!r) {
        await sendTelegramMessage(chatId, "Linking is temporarily unavailable. Try again later.");
        return NextResponse.json({ ok: true });
      }

      const wallet = await r.get<string>(`telegram:linkcode:${code}`);
      if (!wallet) {
        await sendTelegramMessage(
          chatId,
          "Invalid or expired code. Generate a new one at clawcoach.ai → Agent page → Link Telegram.",
        );
        return NextResponse.json({ ok: true });
      }

      // Code is valid — delete it (one-time use)
      await r.del(`telegram:linkcode:${code}`);

      // Save link in Supabase
      try {
        const db = createServerClient();
        const username = message.from.first_name ?? null;
        await db.from("telegram_links").upsert(
          {
            telegram_chat_id: chatId.toString(),
            wallet_address: wallet,
            telegram_username: username,
          },
          { onConflict: "telegram_chat_id" },
        );

        const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
        await sendTelegramMessage(
          chatId,
          `Wallet linked! ${shortWallet}\n\nYour Telegram is now connected to your ClawCoach agent. Coaching history and $CLAWC rewards will sync across platforms.`,
        );
      } catch (err) {
        console.error("[telegram] Link save error:", err);
        await sendTelegramMessage(
          chatId,
          "Failed to save link. Please try again or contact support.",
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Load conversation history
    const history = await loadHistory(chatId);

    // Append user message
    history.push({ role: "user", content: userText });

    // Build messages array for Claude
    const systemPrompt = buildSystemPrompt(DEFAULT_AGENT_NAME, DEFAULT_COACHING_STYLE);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      messages: history,
    });

    const firstBlock = response.content[0];
    const text = firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

    if (text) {
      // Append assistant response to history
      history.push({ role: "assistant", content: text });
      await saveHistory(chatId, history);
      await sendTelegramMessage(chatId, text);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Webhook error:", err);
    // Always return 200 so Telegram doesn't retry
    return NextResponse.json({ ok: true });
  }
}
