# SESSION_HANDOFF.md

> **Purpose**: Transfer context between Claude Code sessions. Update at end of every session.

---

## Last Session

- **Date**: 2026-02-10
- **Duration**: Session 14
- **Branch**: `main`
- **Model**: Claude Opus 4.6

---

## What Was Done

### Session 14 (This Session)

1. **Multi-token pricing model** — `0398f91 feat(pricing): add multi-token pricing model + Supabase setup guide`
   - Reworked pricing page: Stake $FIT OR Subscribe with USDC/ETH
   - Created `src/config/pricing.ts` — tier definitions, price helpers, billing periods
   - Created `src/components/pricing/PricingPageContent.tsx` — interactive client component with Stake/Subscribe toggle, USDC/ETH token selector, Monthly/Quarterly/Annual billing (10% / 20% discounts)
   - Pricing tiers: Free / $10 / $50 / $200 per month (or equivalent FIT staking)
   - Cross-sell on each card ("or stake X FIT" / "or $X/mo subscription")
   - Context-aware FAQ section (staking info vs subscription info)
   - Created `/subscribe` placeholder page ("Coming soon" + CTA to stake)

2. **Supabase setup guide** — `docs/SUPABASE_SETUP.md`
   - Complete SQL schema (6 tables: users, agents, messages, workouts, coaching_sessions, subscriptions)
   - RLS policies, indexes, triggers
   - Verification checklist
   - Pushed to GitHub for Claude.ai consumption

3. **Database types updated** — `src/types/database.ts`
   - Added `messages` table type (for chat persistence)
   - Added `subscriptions` table type (for multi-token subscriptions)

4. **Sprint tracking updated** — `tasks/CURRENT_SPRINT.md`
   - TASK-010 (Agent Coaching Chat) → Done
   - TASK-011 (Landing Page Wiring) → Done (partial — Privy + ETH pricing deferred)
   - Added TASK-012 (Multi-token pricing), TASK-013 (XMTP), TASK-014 (Telegram)
   - TASK-009 (Supabase) moved to In Progress

5. **XMTP integration research** — NOT YET IMPLEMENTED, research complete
   - Explored `@xmtp/browser-sdk` v5.2.0 and `@xmtp/xmtp-js` v13.0.4
   - Decision: MVP approach = Browser XMTP + HTTP AI
   - Decision: Generate new dedicated wallet for agent's XMTP identity (not deployer)
   - Key finding: `@xmtp/browser-sdk` requires COOP/COEP headers that break WalletConnect popups
   - Recommendation: Use `@xmtp/xmtp-js` (V2) for MVP — no special headers needed
   - Plan was being designed when session hit 78% context

6. **All checks pass**: typecheck, lint, build (14 routes including /subscribe)

### Session 13 (Previous)

- ERC-8128 agent auth infrastructure + Agent Hub at `/hub` + 3 protected API routes + TASK-011 buttons wired + Upstash Redis configured

### Sessions 1-12

- Dev environment, scaffold, wallet, 4 contracts, 216 tests, staking UI, Base Sepolia deployment, shared layout, agent creation, dashboard, landing page, pricing page, rebrand to ClawCoach, per-wallet rate limiting, streaming chat

---

## What's In Progress

- **XMTP Integration (TASK-013)** — Research complete, implementation not started. See "XMTP Research Summary" below.
- **Supabase Setup (TASK-009)** — Michael setting up project with Claude.ai. Guide at `docs/SUPABASE_SETUP.md`.

---

## XMTP Research Summary (For Next Session)

### Architecture Decision
- **MVP Approach**: Browser XMTP + HTTP AI
  - User connects wallet → initializes XMTP client in browser
  - AI coaching chat continues via existing HTTP/Claude flow (`/api/chat`)
  - Messages persist on XMTP network (user-side)
  - Phase 2: Full XMTP agent service

### SDK Choice
- **Use `@xmtp/xmtp-js` (V2, v13.0.4)** — NOT `@xmtp/browser-sdk`
- Reason: Browser SDK (V3) requires COOP/COEP headers that break WalletConnect popups
- V2 works without special headers, compatible with wagmi/viem via signer adapter

### Agent XMTP Wallet
- Generate NEW dedicated wallet (not deployer — deployer changes at mainnet)
- `NEXT_PUBLIC_CLAWCOACH_AGENT_XMTP_ADDRESS` (public)
- `CLAWCOACH_AGENT_XMTP_KEY` (server-only, Phase 2)

### Implementation Steps
1. `pnpm add @xmtp/xmtp-js`
2. Create viem-to-XMTP signer adapter
3. Create `src/hooks/useXmtpClient.ts`
4. Create `src/components/agent/XmtpStatus.tsx`
5. Update `AgentChat` with optional XMTP mode
6. Wire landing page XMTP button → `/agent`
7. Generate agent wallet, add env vars

### XMTP V2 API Reference
```typescript
import { Client } from '@xmtp/xmtp-js';
const xmtp = await Client.create(signer, { env: 'dev' });
const convo = await xmtp.conversations.newConversation(peerAddress);
await convo.send('Hello');
for await (const msg of await convo.streamMessages()) { ... }
```

### Key Files for Integration
- `src/hooks/useChat.ts` — existing chat hook
- `src/components/agent/AgentChat.tsx` — chat container
- `src/components/agent/AgentPageContent.tsx` — agent page wrapper
- `src/config/wagmi.ts` — wallet config
- `src/app/page.tsx:158-174` — XMTP button stub

---

## What's Next

1. **XMTP Integration (TASK-013)** — implement steps above
2. **Supabase Integration (TASK-009)** — when Michael has credentials
3. **Telegram Integration (TASK-014)**
4. **Vercel password protection** — dashboard toggle
5. **Privy integration** — email/social onboarding
6. **Wearable integration** — Strava OAuth
7. **ERC-8128 Phase 2** — agent runtime

---

## Decisions Made

- **Pricing model**: DUAL — Stake $FIT OR Subscribe USDC/ETH (Session 14)
- **Subscription pricing**: Free / $10 / $50 / $200 per month
- **Billing discounts**: Quarterly 10%, Annual 20%
- **XMTP SDK**: `@xmtp/xmtp-js` V2 for MVP (avoids COOP/COEP issues)
- **XMTP architecture**: Browser-side + HTTP AI for MVP
- **Agent XMTP wallet**: New dedicated wallet (not deployer)
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
- `pnpm lint`: **PASSES**
- `pnpm build`: **PASSES** (14 routes)

---

## On-Chain State (Base Sepolia)

- **Deployer**: `0xAd4E23f274cdF74754dAA1Fb03BF375Db2eBf5C2`
- **FIT supply**: 10,000 FIT | **Wallet**: 475 FIT | **Staked**: 9,500 FIT
- **Tier**: Pro (2) | **FeeCollector**: 25 FIT
- **Agent #1**: "daddy", motivator

---

## Environment Notes

- **Foundry**: v1.5.1 at `~/.foundry/bin/`
- **pnpm**: v10.29.1 | **Next.js**: 16.1.6 | **Node**: LTS
- **Project**: `~/Projects/moltcoach`
- **Configured**: ANTHROPIC_API_KEY, Upstash Redis
- **NOT configured**: Supabase (guide ready), Coinbase Wallet project ID

---

*Last updated: Feb 10, 2026 — Session 14*
