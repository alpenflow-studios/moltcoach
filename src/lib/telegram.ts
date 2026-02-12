import { Bot } from "grammy";

/**
 * Telegram bot configuration for ClawCoach.
 *
 * Bot token comes from BotFather (@BotFather on Telegram).
 * Set TELEGRAM_BOT_TOKEN in .env.local.
 *
 * Webhook URL should be set to: https://clawcoach.ai/api/telegram
 * Use: https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://clawcoach.ai/api/telegram
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

let bot: Bot | null = null;

export function getTelegramBot(): Bot | null {
  if (!TELEGRAM_BOT_TOKEN) return null;
  if (!bot) {
    bot = new Bot(TELEGRAM_BOT_TOKEN);
  }
  return bot;
}
