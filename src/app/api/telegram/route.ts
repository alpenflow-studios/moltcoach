import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/systemPrompt";

const anthropic = new Anthropic();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const DEFAULT_AGENT_NAME = "ClawCoach";
const DEFAULT_COACHING_STYLE = "motivator";

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string };
    chat: { id: number; type: string };
    text?: string;
  };
};

async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

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
      await sendTelegramMessage(
        chatId,
        "Welcome to ClawCoach! I'm your AI fitness coach. Tell me about your fitness goals and I'll create a personalized plan for you.\n\nTip: Connect your wallet at clawcoach.ai for on-chain identity and $CLAWC rewards.",
      );
      return NextResponse.json({ ok: true });
    }

    // Send to Claude
    const systemPrompt = buildSystemPrompt(DEFAULT_AGENT_NAME, DEFAULT_COACHING_STYLE);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userText }],
    });

    const firstBlock = response.content[0];
    const text = firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

    if (text) {
      await sendTelegramMessage(chatId, text);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Webhook error:", err);
    // Always return 200 so Telegram doesn't retry
    return NextResponse.json({ ok: true });
  }
}
