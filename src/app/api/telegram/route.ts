import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTelegramBot } from "@/lib/telegram";
import { buildSystemPrompt } from "@/lib/systemPrompt";

const anthropic = new Anthropic();

/**
 * Telegram webhook handler (App Router).
 *
 * Receives updates from Telegram Bot API and responds via ClawCoach agent.
 * Manually processes updates instead of using grammy's webhookCallback,
 * which expects Pages Router (req, res) format.
 */

const DEFAULT_AGENT_NAME = "ClawCoach";
const DEFAULT_COACHING_STYLE = "motivator";

const bot = getTelegramBot();

if (bot) {
  bot.on("message:text", async (ctx) => {
    const userMessage = ctx.message.text;

    if (userMessage.startsWith("/start")) {
      await ctx.reply(
        "Welcome to ClawCoach! I'm your AI fitness coach. Tell me about your fitness goals and I'll create a personalized plan for you.\n\nTip: Connect your wallet at clawcoach.ai for on-chain identity and $CLAWC rewards.",
      );
      return;
    }

    try {
      const systemPrompt = buildSystemPrompt(
        DEFAULT_AGENT_NAME,
        DEFAULT_COACHING_STYLE,
      );

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      const firstBlock = response.content[0];
      const text =
        firstBlock && firstBlock.type === "text" ? firstBlock.text : "";

      if (text) {
        await ctx.reply(text);
      }
    } catch (err) {
      console.error("[telegram] Error processing message:", err);
      await ctx.reply(
        "Sorry, I hit a snag. Try again in a moment.",
      );
    }
  });
}

export async function POST(req: Request): Promise<Response> {
  if (!bot) {
    return NextResponse.json(
      { error: "Telegram bot not configured. Set TELEGRAM_BOT_TOKEN." },
      { status: 503 },
    );
  }

  try {
    const update = await req.json();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[telegram] Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
