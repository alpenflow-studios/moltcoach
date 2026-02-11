# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-11
- **Duration**: Session 17
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 17 (This Session)

1. **XMTP Persistence Confirmed**
   - Michael tested full loop: send → refresh → reconnect → history loads with context
   - TASK-013 fully complete (all acceptance criteria met)

2. **Supabase Integration (TASK-009) — COMPLETE**
   - Created fresh Supabase project `clawcoach` (East US/Ohio, ref: `agvdivapnrqpstvhkbmk`)
   - 3 env vars configured in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Created 6 database tables via Supabase Management API: `users`, `agents`, `messages`, `workouts`, `coaching_sessions`, `subscriptions`
   - RLS enabled on all 6 tables (SELECT for anon key, service_role bypasses all)
   - Updated `src/types/database.ts` with `Relationships` + `CompositeTypes` (required by `@supabase/supabase-js` v2.95)

3. **New Files Created**
   - `src/lib/supabase.ts` — added `createServerClient()` using `SUPABASE_SERVICE_ROLE_KEY`
   - `src/app/api/users/route.ts` — POST upserts user by wallet address
   - `src/app/api/messages/route.ts` — GET loads chat history, POST saves message pairs
   - `src/app/api/agents/sync/route.ts` — POST upserts agent from on-chain data
   - `src/hooks/useChatHistory.ts` — loads Supabase history on mount, provides `saveMessages` callback
   - `src/hooks/useUserSync.ts` — auto-upserts user to Supabase on wallet connect

4. **Modified Files**
   - `src/components/providers/WalletProvider.tsx` — added `WalletSyncProvider` wrapper with `useUserSync`
   - `src/components/agent/AgentPageContent.tsx` — added Supabase chat history loading + agent sync effect
   - `src/components/agent/AgentChat.tsx` — saves messages to Supabase after each exchange, loads Supabase history (priority over XMTP)
   - `src/types/database.ts` — full rewrite with Relationships for Supabase JS v2.95 compat

5. **Supabase Connection Notes**
   - Project region: East US (Ohio) — NOT us-west-1 as initially assumed
   - Direct DB connection (`db.[ref].supabase.co`) is disabled on this project
   - Pooler connection also failed ("Tenant not found" across all regions)
   - Used Supabase Management API (`POST /v1/projects/{ref}/database/query`) for all DDL
   - Access token required: `sbp_...` (generated from dashboard/account/tokens)

### Session 16 (Previous)

- XMTP V3 migration complete, agent registered, dev server switched to webpack, temp files cleaned up

### Sessions 1-15

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment, shared layout, agent creation, dashboard, landing page, pricing page, rebrand to ClawCoach, per-wallet rate limiting, streaming chat, ERC-8128 agent auth, Agent Hub, multi-token pricing, Supabase setup guide, XMTP V2 code (blocked), XMTP V3 migration

---

## What's In Progress

Nothing in progress — Session 17 completed cleanly. Changes NOT yet committed.

---

## What's Next

1. **Commit Session 17 changes** — Supabase integration (TASK-009)
2. **Test Supabase end-to-end** — connect wallet → verify user upserted → chat → verify messages saved → refresh → verify history loads
3. **Telegram Integration (TASK-014)** — not started
4. **Vercel password protection** — dashboard toggle
5. **Privy integration** — email/social onboarding
6. **Multi-token pricing (TASK-012)** — not started

---

## Supabase Architecture (Implemented)

### How It Works
```
User connects wallet
  → useUserSync fires → POST /api/users → upserts user in Supabase

User visits /agent with existing agent
  → AgentPageContent effect → POST /api/agents/sync → upserts agent in Supabase
  → useChatHistory → GET /api/messages → loads prior chat history
  → useChat seeds with Supabase history (priority) or XMTP history (fallback)

User sends message
  → POST /api/chat → Claude streams response
  → onMessageComplete fires:
    ├─ POST /api/messages → saves user + assistant messages to Supabase
    └─ XMTP mirror (if connected) → writes to XMTP DM
```

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Anon client (reads) + `createServerClient()` (writes) |
| `src/app/api/users/route.ts` | Upsert user by wallet address |
| `src/app/api/messages/route.ts` | Load + save chat messages |
| `src/app/api/agents/sync/route.ts` | Upsert agent from on-chain data |
| `src/hooks/useUserSync.ts` | Auto-sync wallet to Supabase |
| `src/hooks/useChatHistory.ts` | Load history + save callback |
| `src/types/database.ts` | Full typed schema (6 tables) |

### Supabase Project Details
| Field | Value |
|-------|-------|
| Project name | `clawcoach` |
| Reference ID | `agvdivapnrqpstvhkbmk` |
| Region | East US (Ohio) |
| URL | `https://agvdivapnrqpstvhkbmk.supabase.co` |
| Tables | users, agents, messages, workouts, coaching_sessions, subscriptions |
| RLS | Enabled on all tables, SELECT-only for anon key |

---

## XMTP Architecture (Implemented — V3)

### How It Works (MVP)
```
User clicks "Connect XMTP" in chat header
  → useXmtpClient: dynamic import @xmtp/browser-sdk, create V3 client (wallet signature)
  → useXmtpConversation: createDmWithIdentifier(agent address), sync(), load history

User sends message:
  ├─ HTTP path (existing): POST /api/chat → Claude → streamed response
  └─ XMTP path (new): onMessageComplete callback writes both user + AI messages to XMTP DM

On page reload with XMTP connected:
  → Load DM history from XMTP → seed useChat with initialMessages
```

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/xmtpSigner.ts` | viem → XMTP V3 signer adapter |
| `src/config/xmtp.ts` | XMTP env, agent address, prefix constant |
| `src/hooks/useXmtpClient.ts` | V3 client lifecycle + structural types |
| `src/hooks/useXmtpConversation.ts` | DM creation, sync, history, send |
| `src/components/agent/XmtpStatus.tsx` | Status badge component |

---

## Decisions Made

- **Supabase project**: `clawcoach`, East US (Ohio), ref `agvdivapnrqpstvhkbmk` (Session 17)
- **Supabase auth model**: Wallet-based (not Supabase Auth). Anon key for reads, service_role for writes via API routes (Session 17)
- **Chat persistence priority**: Supabase history > XMTP history > empty (Session 17)
- **Agent sync**: Idempotent upsert on every agent page load (Session 17)
- **XMTP V3 SDK**: `@xmtp/browser-sdk` v6.3.0 (V2 deprecated, forced migration) (Session 16)
- **XMTP agent inbox ID**: `b9e2011e0f68256545dc1ee6d06e6de0b38c6721b5dbd424e31503b619a17964` (Session 16)
- **Dev bundler**: webpack (not Turbopack) — XMTP WASM workers incompatible with Turbopack (Session 16)
- **XMTP agent address**: `0xC7F839B81bc55a400423B7c8A6beF0Ad7c48E4bB` (Session 15)
- **XMTP message convention**: `[assistant] ` prefix for AI responses from user's client (Session 15)
- **XMTP dynamic import**: code-split, only loaded on "Connect XMTP" click (Session 15)
- **Pricing model**: DUAL — Stake $FIT OR Subscribe USDC/ETH (Session 14)
- **Subscription pricing**: Free / $10 / $50 / $200 per month
- **Billing discounts**: Quarterly 10%, Annual 20%
- **Theme**: Dark mode, lime primary on zinc
- **wagmi**: v3.4.2
- **Wallets**: Multi-wallet (MetaMask + Coinbase Smart Wallet + WalletConnect)
- **ERC-8004**: Custom non-upgradeable
- **ERC-8128**: `@slicekit/erc8128`, Upstash Redis nonce store
- **Agent Hub**: `/hub` — chain events, no Supabase dependency
- **API versioning**: `/api/v1/` for agent endpoints
- **Revenue**: 9 streams, MVP focuses on 3. Treasury 40/30/20/10
- **Chat model**: claude-sonnet-4-5-20250929
- **Brand**: ClawCoach (clawcoach.ai)
- **Beta**: Vercel password + rate limiting (50/hr, 200/day)

---

## State of Tests

- `forge test`: **216 tests pass**
- `pnpm typecheck`: **PASSES**
- `pnpm lint`: **PASSES** (0 errors, 0 warnings)
- `pnpm build`: **PASSES** (17 routes — 3 new API routes)

---

## On-Chain State (Base Sepolia)

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **FIT supply**: 10,000 FIT | **Wallet**: 475 FIT | **Staked**: 9,500 FIT
- **Tier**: Pro (2) | **FeeCollector**: 25 FIT
- **Agent #1**: "daddy", motivator

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/`
- **pnpm**: v10.29.1 | **Next.js**: 16.1.6 | **Node**: v25.6.0
- **Project**: `~/Projects/moltcoach`
- **Dev server**: `pnpm dev` uses `--webpack` (not Turbopack) for XMTP WASM compatibility
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis, XMTP agent (V3), Supabase (`clawcoach` project)
- **NOT configured**: Coinbase Wallet project ID

---

*Last updated: Feb 11, 2026 — Session 17*
