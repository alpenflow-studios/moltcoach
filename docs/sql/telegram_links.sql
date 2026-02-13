-- Telegram wallet linking table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/agvdivapnrqpstvhkbmk/sql

CREATE TABLE IF NOT EXISTS telegram_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  telegram_username TEXT,
  linked_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for wallet lookups (find all Telegram chats linked to a wallet)
CREATE INDEX IF NOT EXISTS idx_telegram_links_wallet ON telegram_links (wallet_address);

-- RLS: service role only (API routes handle auth)
ALTER TABLE telegram_links ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (API routes use service role key)
CREATE POLICY "Service role full access" ON telegram_links
  FOR ALL
  USING (auth.role() = 'service_role');
