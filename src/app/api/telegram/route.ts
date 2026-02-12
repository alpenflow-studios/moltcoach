import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTelegramBot } from "@/lib/telegram";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { webhookCallback } from "grammy";

const anthropic = new Anthropic();

/**
 * Telegram webhook handler.
 *
 * Receives updates from Telegram Bot API and responds via ClawCoach agent.
 * Default coaching style is "motivator" for Telegram users (no wallet-based
 * onboarding yet — that requires linking wallet to Telegram chat ID).
 */

const DEFAULT_AGENT_NAME = "ClawCoach";
const DEFAULT_COACHING_STYLE = "motivator";

const bot = getTelegramBot();

if (bot) {
  bot.on("message:text", async (ctx) => {
    const userMessage = ctx.message.text;

    // Skip commands for now (handled separately in future)
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

// Export webhook handler — grammy handles update parsing and routing
export const POST = bot
  ? (webhookCallback(bot, "next-js") as unknown as (req: Request) => Promise<Response>)
  : async () =>
      NextResponse.json(
        { error: "Telegram bot not configured. Set TELEGRAM_BOT_TOKEN." },
        { status: 503 },
      );
