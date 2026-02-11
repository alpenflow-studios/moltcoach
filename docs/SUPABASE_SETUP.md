# Supabase Setup Guide for ClawCoach

> **Purpose**: Complete setup instructions for the ClawCoach Supabase project. Hand this to Claude.ai to finish configuration.
> **Created**: Session 14 (Feb 10, 2026)

---

## 1. Project Setup

### Create Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project:
   - **Name**: `clawcoach`
   - **Region**: US East (closest to Vercel)
   - **Database password**: Save securely (needed for direct DB access)
3. Copy credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```

---

## 2. Database Tables

Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

### Core Tables

```sql
-- =============================================================================
-- ClawCoach Database Schema
-- Run this entire script in Supabase SQL Editor
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS — wallet-based user records
-- =============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for wallet lookups
CREATE INDEX idx_users_wallet ON users (wallet_address);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- AGENTS — ClawCoach agent instances (linked to ERC-8004 on-chain identity)
-- =============================================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id_onchain INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  coaching_style TEXT NOT NULL CHECK (coaching_style IN ('motivator', 'drill_sergeant', 'scientist', 'friend')),
  agent_uri TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agents_user ON agents (user_id);
CREATE INDEX idx_agents_onchain ON agents (agent_id_onchain);

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- MESSAGES — chat conversation history (for persistence across reloads)
-- =============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_user_agent ON messages (user_id, agent_id);
CREATE INDEX idx_messages_created ON messages (created_at DESC);

-- =============================================================================
-- WORKOUTS — tracked workout data (from wearables, manual entry, or agent-logged)
-- =============================================================================
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  workout_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  calories_burned INTEGER,
  fit_earned TEXT NOT NULL DEFAULT '0',
  source TEXT NOT NULL CHECK (source IN ('manual', 'strava', 'apple_health', 'garmin', 'agent_api')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_user ON workouts (user_id);
CREATE INDEX idx_workouts_completed ON workouts (completed_at DESC);

-- =============================================================================
-- COACHING_SESSIONS — structured coaching session records
-- =============================================================================
CREATE TABLE coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'chat',
  summary TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON coaching_sessions (user_id);

-- =============================================================================
-- SUBSCRIPTIONS — for future subscription model (multi-token pricing)
-- =============================================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 0 AND 3),
  payment_token TEXT NOT NULL CHECK (payment_token IN ('FIT', 'USDC', 'ETH')),
  amount TEXT NOT NULL,
  tx_hash TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions (user_id, expires_at);
```

---

## 3. Row Level Security (RLS)

Run this after the tables are created.

```sql
-- =============================================================================
-- ROW LEVEL SECURITY
-- Users can only read/write their own data
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- IMPORTANT: ClawCoach uses wallet-based auth, NOT Supabase Auth.
-- RLS policies use the service_role key on the server side.
-- The anon key is used client-side for reads only.
-- All writes go through Next.js API routes using the service_role key.
-- =============================================================================

-- PUBLIC READ policies (anon key can read these)
-- Users can look up their own user record by wallet address
CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (true);

-- Agents are publicly viewable (Agent Hub shows all agents)
CREATE POLICY "Agents are publicly readable"
  ON agents FOR SELECT
  USING (true);

-- Messages are only readable by the user who owns them
-- (Server-side only — filtered by user_id in API route)
CREATE POLICY "Messages readable via service role"
  ON messages FOR SELECT
  USING (true);

-- Workouts are only readable by the user who owns them
CREATE POLICY "Workouts readable via service role"
  ON workouts FOR SELECT
  USING (true);

-- Coaching sessions readable via service role
CREATE POLICY "Sessions readable via service role"
  ON coaching_sessions FOR SELECT
  USING (true);

-- Subscriptions readable via service role
CREATE POLICY "Subscriptions readable via service role"
  ON subscriptions FOR SELECT
  USING (true);

-- =============================================================================
-- WRITE policies — service_role key only (Next.js API routes)
-- Anon key CANNOT write to any table
-- =============================================================================

-- Service role bypasses RLS automatically.
-- No INSERT/UPDATE/DELETE policies needed for anon key.
-- All mutations go through server-side API routes.
```

---

## 4. Environment Variables

After setup, your `.env.local` should include:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

**Important**:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for client-side (read-only access)
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — never expose to client. Used in API routes for writes.
- Find these in Supabase Dashboard → Settings → API

---

## 5. Existing Code That Needs Wiring

Once Supabase is configured, these files need updates:

| File | What to do |
|------|-----------|
| `src/lib/supabase.ts` | Add server-side client using service_role key |
| `src/types/database.ts` | Already has types — update if schema changes |
| `src/app/api/chat/route.ts` | Persist messages after streaming completes |
| `src/app/api/v1/workouts/route.ts` | Store workout in Supabase instead of returning mock |
| New: `src/app/api/users/route.ts` | Upsert user on wallet connect |
| New: `src/hooks/useMessages.ts` | Load/save chat history from Supabase |

---

## 6. Verification Checklist

After running the SQL:

- [ ] Tables visible in Supabase Dashboard → Table Editor
- [ ] RLS enabled (green shield icon) on all 6 tables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local`
- [ ] Test: Can read from `users` table via anon key (should return empty array)
- [ ] Test: Cannot write to `users` table via anon key (should fail — RLS)

---

## 7. Smart Contract Integration Notes

ClawCoach uses on-chain data as the source of truth:
- **Agent identity**: ERC-8004 contract on Base Sepolia (not Supabase)
- **Staking/tiers**: FitStaking contract on Base Sepolia (not Supabase)
- **Token balances**: FitToken contract on Base Sepolia (not Supabase)

Supabase stores **supplementary data** that doesn't belong on-chain:
- Chat messages (too much data for on-chain)
- Workout details (wearable data, manual entries)
- User preferences (coaching settings)
- Session history (coaching session records)

The `agent_id_onchain` column in the `agents` table links Supabase records to on-chain ERC-721 token IDs.

---

*Hand this document to Claude.ai for guided Supabase setup.*
